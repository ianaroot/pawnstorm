# frozen_string_literal: true

namespace :bots do
  desc 'Clone a bot and migrate supported V1 condition nodes to V2 grammar. Usage: rake "bots:migrate_to_v2_grammar_clone[source,target_name]"'
  task :migrate_to_v2_grammar_clone, [:source, :target_name] => :environment do |_task, args|
    source_ref = args[:source].presence || ENV['SOURCE']
    abort 'Provide SOURCE bot name or id.' if source_ref.blank?

    source_bot = if source_ref.to_s.match?(/\A\d+\z/)
      Bot.find_by(id: source_ref) || Bot.find_by(name: source_ref)
    else
      Bot.find_by(name: source_ref)
    end

    abort "Could not find bot #{source_ref.inspect}." unless source_bot

    target_name = args[:target_name].presence || ENV['TARGET_NAME'].presence || "#{normalized_clone_base_name(source_bot.name)} V__2G"
    abort "Target bot #{target_name.inspect} already exists." if Bot.exists?(name: target_name)

    migrator = BotV2GrammarMigrator.new(source_bot:, target_name:)
    result = migrator.run!

    puts "Created clone: #{result.fetch(:target_bot).name}"
    puts "Translated nodes: #{result.fetch(:translated_count)}"
    puts "Already V2 nodes: #{result.fetch(:already_v2_count)}"
    puts "Unsupported nodes left as V1: #{result.fetch(:unsupported).length}"

    if result.fetch(:unsupported).any?
      puts 'Unsupported condition nodes:'
      result.fetch(:unsupported).each do |entry|
        puts "  node #{entry.fetch(:node_id)}: #{entry.fetch(:reason)}"
        puts "    #{entry.fetch(:summary)}"
      end
    end
  end
end

class BotV2GrammarMigrator
  RELATIONAL_RULES = {
    'attacker' => { operator: 'attack', related_side: :subject, comparison_side: :subject, related_team: :opposing },
    'attacked' => { operator: 'attack', related_side: :target, comparison_side: :subject, related_team: :opposing },
    'defender' => { operator: 'defend', related_side: :subject, comparison_side: :subject, related_team: :same },
    'defended' => { operator: 'defend', related_side: :target, comparison_side: :subject, related_team: :same },
    'adjacent' => { operator: 'adjacent', related_side: :subject, comparison_side: :subject, related_team: :same },
    'shielder' => { operator: 'shield', related_side: :subject, comparison_side: :subject, related_team: :same },
    'shielded' => { operator: 'shield', related_side: :target, comparison_side: :target, related_team: :same },
    'coverer' => { operator: 'cover', related_side: :subject, comparison_side: :subject, related_team: :same },
    'covered' => { operator: 'cover', related_side: :target, comparison_side: :target, related_team: :same }
  }.freeze

  UNARY_RELATIONS = %w[count mobility value].freeze

  def initialize(source_bot:, target_name:)
    @source_bot = source_bot
    @target_name = target_name
  end

  def run!
    target_bot = nil
    translated_count = 0
    already_v2_count = 0
    unsupported = []

    Bot.transaction do
      target_bot, node_map = clone_graph!

      target_bot.nodes.where(node_type: 'condition').find_each do |node|
        version = (node.data['version'] || node.data[:version] || 1).to_i
        if version == 2
          already_v2_count += 1
          next
        end

        translated = translate_condition(node.data)
        if translated
          node.update!(data: translated)
          translated_count += 1
        else
          unsupported << unsupported_entry(node)
        end
      end

    end

    target_bot = Bot.find_by!(name: @target_name)
    target_bot.compile_program!

    {
      target_bot: target_bot,
      translated_count: translated_count,
      already_v2_count: already_v2_count,
      unsupported: unsupported
    }
  end

  private

  def clone_graph!
    target_bot = @source_bot.user.bots.create!(
      name: @target_name,
      description: [@source_bot.description, "Migrated from #{@source_bot.name} by bots:migrate_to_v2_grammar_clone."].compact.join(' ')
    )

    source_root = @source_bot.root_node
    target_root = target_bot.root_node
    node_map = { source_root.id => target_root }

    @source_bot.nodes.where.not(node_type: 'root').find_each do |node|
      node_map[node.id] = target_bot.nodes.create!(
        node_type: node.node_type,
        position_x: node.position_x,
        position_y: node.position_y,
        data: node.data.deep_dup
      )
    end

    @source_bot.nodes.find_each do |node|
      node.outgoing_connections.find_each do |connection|
        Connection.create!(
          source_node: node_map.fetch(connection.source_node_id),
          target_node: node_map.fetch(connection.target_node_id)
        )
      end
    end

    [target_bot, node_map]
  end

  def translate_condition(data)
    raw = data.is_a?(Hash) ? data.deep_stringify_keys : {}
    relation = raw['relation']

    if UNARY_RELATIONS.include?(relation)
      translate_unary(raw)
    elsif RELATIONAL_RULES.key?(relation)
      translate_relational(raw, RELATIONAL_RULES.fetch(relation))
    end
  end

  def translate_unary(raw)
    actor = actor_from_subject(raw['subject'])
    return nil unless actor

    filter, filter_mode = filter_and_mode(raw['subjectSpecifier'], raw['subjectSpecifierMode'])

    {
      version: 2,
      kind: 'unary',
      subject: actor,
      subjectFilter: filter,
      subjectFilterMode: filter_mode_if_needed(filter, filter_mode),
      operator: raw['relation'],
      comparator: raw['comparison'],
      comparisonValue: raw['comparisonValue']
    }.compact
  end

  # Translation examples:
  # - opponents king attacker > 0
  #   means allied pieces attack enemy king
  #   => allied(any) attack enemy(king)
  #
  # - opponents king attacker > 1
  #   means more than one allied piece attacks enemy king
  #   => allied(any count > 1) attack enemy(king)
  #
  # - opponents any attacked moved_piece > 1
  #   means more than one enemy piece attacks the moved piece
  #   => enemy(any count > 1) attack moved_piece
  #
  # - opponents king shielder = 0
  #   means no enemy piece shields the enemy king
  #   => enemy(any count = 0) shield enemy(king)
  #
  # - opponents king adjacent < prior_board_state
  #   means fewer enemy pieces are adjacent to the enemy king than before
  #   => enemy(any count < prior_board_state) adjacent enemy(king)
  #
  # - opponents queen attacked moved_piece > 0
  #   means enemy queens attack the moved piece
  #   => enemy(queen) attack moved_piece
  def translate_relational(raw, rule)
    anchor_actor = actor_from_subject(raw['subject'])
    return nil unless anchor_actor

    anchor_filter, anchor_filter_mode = filter_and_mode(raw['subjectSpecifier'], raw['subjectSpecifierMode'])
    related_side = rule.fetch(:related_side)
    related_actor, related_filter, related_filter_mode = related_side_specification(raw, rule)
    return nil unless related_actor

    left_actor, left_filter, left_filter_mode, right_actor, right_filter, right_filter_mode =
      if related_side == :subject
        [related_actor, related_filter, related_filter_mode, anchor_actor, anchor_filter, anchor_filter_mode]
      else
        [anchor_actor, anchor_filter, anchor_filter_mode, related_actor, related_filter, related_filter_mode]
      end

    data = {
      version: 2,
      kind: 'relational',
      subject: left_actor,
      subjectFilter: left_filter,
      subjectFilterMode: filter_mode_if_needed(left_filter, left_filter_mode),
      operator: rule.fetch(:operator),
      target: right_actor,
      targetFilter: right_filter,
      targetFilterMode: filter_mode_if_needed(right_filter, right_filter_mode)
    }.compact

    comparison = comparison_payload(raw)
    if comparison
      comparison_prefix = rule.fetch(:comparison_side) == :subject ? 'subject' : 'target'
      data[:"#{comparison_prefix}ComparisonMetric"] = comparison.fetch(:metric)
      data[:"#{comparison_prefix}Comparator"] = comparison.fetch(:comparator)
      data[:"#{comparison_prefix}ComparisonSource"] = 'exact_number'
      data[:"#{comparison_prefix}ComparisonSourceTotal"] = comparison.fetch(:comparison_value)
    end

    data
  end

  def related_side_specification(raw, rule)
    specifier = raw['relationSpecifier'].presence || 'any'
    specifier_mode = raw['relationSpecifierMode'].presence || 'include'

    if specifier == 'moved_piece'
      return nil if specifier_mode == 'exclude'
      return ['moved_piece', 'any', 'include']
    end

    actor = actor_for_relative_team(raw['subject'], rule.fetch(:related_team))
    return nil unless actor

    filter, filter_mode = filter_and_mode(specifier, specifier_mode)
    [actor, filter, filter_mode]
  end

  def comparison_payload(raw)
    comparison = raw['comparison']
    comparison_value = raw['comparisonValue']

    return nil if comparison == 'greater_than' && comparison_value == 0

    {
      metric: 'count',
      comparator: comparison,
      comparison_value: comparison_value
    }
  end

  def actor_from_subject(subject)
    case subject
    when 'allies' then 'allied'
    when 'opponents' then 'enemy'
    when 'moved_piece' then 'moved_piece'
    when 'captured_piece' then 'captured_piece'
    else nil
    end
  end

  def actor_for_relative_team(subject, relative_team)
    case subject
    when 'allies'
      relative_team == :same ? 'allied' : 'enemy'
    when 'opponents'
      relative_team == :same ? 'enemy' : 'allied'
    when 'moved_piece'
      relative_team == :same ? 'allied' : 'enemy'
    else
      nil
    end
  end

  def filter_and_mode(specifier, specifier_mode)
    filter = specifier.presence || 'any'
    mode = specifier_mode.presence || 'include'
    [filter, mode]
  end

  def filter_mode_if_needed(filter, filter_mode)
    filter == 'any' ? nil : filter_mode
  end

  def unsupported_entry(node)
    data = node.data.deep_stringify_keys
    {
      node_id: node.id,
      reason: unsupported_reason(data),
      summary: data.slice('subject', 'subjectSpecifier', 'subjectSpecifierMode', 'relation', 'relationSpecifier', 'relationSpecifierMode', 'comparison', 'comparisonValue').inspect
    }
  end

  def unsupported_reason(data)
    relation = data['relation']
    return "unsupported relation #{relation.inspect}" unless UNARY_RELATIONS.include?(relation) || RELATIONAL_RULES.key?(relation)
    return 'unsupported subject' unless actor_from_subject(data['subject'])
    return 'exclude moved_piece relationSpecifier has no precise V2 actor equivalent' if data['relationSpecifier'] == 'moved_piece' && (data['relationSpecifierMode'].presence || 'include') == 'exclude'
    'translation rule returned nil'
  end
end

def normalized_clone_base_name(name)
  name.sub(/\s+v2\z/i, '')
end
