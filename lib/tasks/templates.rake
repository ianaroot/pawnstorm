require 'json'
require 'set'

namespace :templates do
  desc "Regenerate editorV2/templates/definitions/*.js from the 'templates' bot in the DB"
  task regenerate: :environment do
    TemplatesRegenerator.new.call
  end
end

class TemplatesRegenerator
  BOT_NAME = 'templates'.freeze
  DEFINITIONS_DIR = Rails.root.join('app/javascript/editorV2/templates/definitions')

  # Apply word-by-word during title-casing (typo fixes, capitalization variants).
  TITLE_WORD_FIXES = {
    'Discoverd' => 'Discovered'
  }.freeze

  # Bot organizer title (after title-casing) -> attributes that override the existing-file lookup.
  # Add an entry here when a new chain is added to the bot, or when moving a chain
  # to a different category than the one currently recorded in the JS files.
  OVERRIDES = {
    'King Pin' => {
      id: 'king-pin',
      category: 'tactics',
      description: 'Reward pinning an enemy piece against its king.'
    },
    'Queen Safety' => {
      category: 'activity'
    }
  }.freeze

  CATEGORY_INFO = {
    'activity'      => { filename: 'activity.js',     const: 'ACTIVITY_TEMPLATES',      enum: 'TEMPLATE_CATEGORIES.ACTIVITY' },
    'captures'      => { filename: 'captures.js',     const: 'CAPTURE_TEMPLATES',       enum: 'TEMPLATE_CATEGORIES.CAPTURES' },
    'defense'       => { filename: 'defense.js',      const: 'DEFENSE_TEMPLATES',       enum: 'TEMPLATE_CATEGORIES.DEFENSE' },
    'endgame'       => { filename: 'endgame.js',      const: 'ENDGAME_TEMPLATES',       enum: 'TEMPLATE_CATEGORIES.ENDGAME' },
    'king_pressure' => { filename: 'kingPressure.js', const: 'KING_PRESSURE_TEMPLATES', enum: 'TEMPLATE_CATEGORIES.KING_PRESSURE' },
    'opening'       => { filename: 'opening.js',      const: 'OPENING_TEMPLATES',       enum: 'TEMPLATE_CATEGORIES.OPENING' },
    'pawn_play'     => { filename: 'pawnPlay.js',     const: 'PAWN_PLAY_TEMPLATES',     enum: 'TEMPLATE_CATEGORIES.PAWN_PLAY' },
    'tactics'       => { filename: 'tactics.js',      const: 'TACTIC_TEMPLATES',        enum: 'TEMPLATE_CATEGORIES.TACTICS' }
  }.freeze

  def call
    bot = Bot.find_by!(name: BOT_NAME)
    existing_metadata = read_existing_metadata
    chains = extract_chains(bot)
    templates = chains.map { |chain| build_template(chain, existing_metadata) }
    assert_unique_ids!(templates)
    write_files!(templates)
    report(templates)
  end

  private

  def read_existing_metadata
    metadata = {}
    CATEGORY_INFO.each do |category, info|
      path = DEFINITIONS_DIR.join(info[:filename])
      next unless File.exist?(path)
      content = File.read(path)
      content.scan(/"?id"?:\s*"([^"]+)",\s*\n\s*"?name"?:\s*"([^"]+)",\s*\n\s*"?category"?:\s*TEMPLATE_CATEGORIES\.\w+,\s*\n\s*"?description"?:\s*"([^"]*)"/) do |id, name, description|
        metadata[name] = { id: id, category: category, description: description }
      end
    end
    metadata
  end

  def extract_chains(bot)
    nodes = bot.nodes.to_a
    nodes_by_id = nodes.index_by(&:id)
    children = Hash.new { |h, k| h[k] = [] }
    bot.connections.find_each { |c| children[c.source_node_id] << c.target_node_id }
    organizers = nodes.select(&:organizer?)

    organizers.filter_map do |org|
      body_ids = collect_body(children, nodes_by_id, org.id)
      next if body_ids.empty?
      chain_ids = ([org.id] + body_ids).to_set
      chain_connections = bot.connections.where(
        source_node_id: chain_ids.to_a,
        target_node_id: chain_ids.to_a
      ).to_a
      {
        organizer: org,
        body_nodes: body_ids.map { |id| nodes_by_id[id] },
        connections: chain_connections
      }
    end
  end

  def collect_body(children, nodes_by_id, organizer_id)
    body = []
    queue = children[organizer_id].dup
    seen = Set.new
    until queue.empty?
      nid = queue.shift
      next if seen.include?(nid)
      seen << nid
      n = nodes_by_id[nid]
      next if n.nil?
      next if n.organizer? # boundary: do not include, do not descend
      body << nid
      queue.concat(children[nid] || [])
    end
    body
  end

  def build_template(chain, existing_metadata)
    organizer = chain[:organizer]
    name = title_case(organizer.data['title'].to_s)
    override = OVERRIDES[name] || {}
    existing = existing_metadata[name] || {}

    id = override[:id] || existing[:id] || name.downcase.tr(' ', '-')
    category = override[:category] || existing[:category]
    description = override[:description] || existing[:description]

    raise "Template #{name.inspect} (organizer ##{organizer.id}): no category. Add an OVERRIDES entry." if category.nil?
    raise "Template #{name.inspect} (organizer ##{organizer.id}): no description. Add an OVERRIDES entry." if description.nil?

    nodes, key_for = build_nodes(organizer, chain[:body_nodes], name)
    connections = chain[:connections].map do |c|
      { 'source' => key_for.fetch(c.source_node_id), 'target' => key_for.fetch(c.target_node_id) }
    end

    {
      id: id,
      name: name,
      category: category,
      description: description,
      nodes: nodes,
      connections: connections
    }
  end

  def build_nodes(organizer, body_nodes, template_name)
    ox = organizer.position_x.to_f
    oy = organizer.position_y.to_f
    key_for = { organizer.id => 'organizer' }
    nodes = [{
      'key' => 'organizer',
      'type' => 'organizer',
      'position' => { 'x' => 0.0, 'y' => 0.0 },
      'data' => { 'title' => template_name, 'notes' => '' }
    }]

    body_nodes.each do |n|
      key = "#{n.node_type == 'score' ? 'action' : 'condition'}_#{n.id}"
      key_for[n.id] = key
      nodes << {
        'key' => key,
        'type' => n.node_type,
        'position' => { 'x' => round_pos(n.position_x - ox), 'y' => round_pos(n.position_y - oy) },
        'data' => sanitized_data(n)
      }
    end

    [nodes, key_for]
  end

  def sanitized_data(node)
    case node.node_type
    when 'condition'
      node.data.slice(*condition_allowed_keys(node))
    when 'score'
      node.data.slice(*Nodes::DataValidator::ACTION_KEYS)
    else
      raise "Unexpected body node type #{node.node_type.inspect} on node ##{node.id}"
    end
  end

  def condition_allowed_keys(node)
    case node.data['kind']
    when 'relational' then Nodes::DataValidator::CONDITION_V2_RELATION_KEYS
    when 'census'     then Nodes::DataValidator::CONDITION_V2_CENSUS_KEYS
    when 'identity'   then Nodes::DataValidator::CONDITION_V2_IDENTITY_KEYS
    else raise "Node ##{node.id}: unknown condition kind #{node.data['kind'].inspect}"
    end
  end

  def round_pos(n)
    rounded = n.round(4)
    rounded == rounded.to_i ? rounded.to_i : rounded
  end

  def title_case(raw)
    raw.split.map(&:capitalize).map { |w| TITLE_WORD_FIXES.fetch(w, w) }.join(' ')
  end

  def assert_unique_ids!(templates)
    seen = {}
    templates.each do |t|
      raise "Duplicate template id #{t[:id].inspect} (#{seen[t[:id]]} and #{t[:name]})" if seen.key?(t[:id])
      seen[t[:id]] = t[:name]
    end
  end

  def write_files!(templates)
    CATEGORY_INFO.each do |category, info|
      cat_templates = templates.select { |t| t[:category] == category }
      File.write(DEFINITIONS_DIR.join(info[:filename]), render_file(info, cat_templates))
    end
  end

  def render_file(info, templates)
    payload = templates.map do |t|
      {
        'id' => t[:id],
        'name' => t[:name],
        'category' => "__CATEGORY_#{info[:enum]}__",
        'description' => t[:description],
        'nodes' => t[:nodes],
        'connections' => t[:connections]
      }
    end
    body = JSON.pretty_generate(payload, indent: '  ')
    body = body.gsub(/"__CATEGORY_(.+?)__"/) { Regexp.last_match(1) }
    <<~JS
      import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'

      export const #{info[:const]} = #{body}
    JS
  end

  def report(templates)
    puts "Wrote #{templates.size} templates across #{CATEGORY_INFO.size} files."
    templates.group_by { |t| t[:category] }.sort.each do |category, group|
      names = group.map { |t| t[:name] }.sort
      puts "  #{category} (#{group.size}): #{names.join(', ')}"
    end
  end
end
