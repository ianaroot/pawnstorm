# frozen_string_literal: true

require 'json'
require 'fileutils'
require 'set'

namespace :templates do
  desc 'Export organizer branches from a bot as editor template definitions.'
  task export_from_bot: :environment do
    source_bot_name = ENV['SOURCE_BOT'].presence || ENV['BOT_NAME'].presence
    output_path = ENV['OUTPUT_PATH'].presence || Rails.root.join('tmp', 'template_export.js').to_s
    config_path = ENV['CONFIG_PATH'].presence
    organizer_ids = split_env_list('ORGANIZER_IDS').map(&:to_i)
    organizer_titles = split_env_list('ORGANIZER_TITLES')

    abort 'Provide SOURCE_BOT.' if source_bot_name.blank?

    bot = Bot.find_by(name: source_bot_name)
    abort "Could not find bot #{source_bot_name.inspect}." unless bot

    config = config_path.present? ? JSON.parse(File.read(config_path)) : {}
    exporter = BotTemplateExport.new(
      bot:,
      config:,
      organizer_ids:,
      organizer_titles:
    )

    templates = exporter.templates
    FileUtils.mkdir_p(File.dirname(output_path))
    File.write(output_path, BotTemplateExportRenderer.render(templates))

    puts "Wrote #{output_path}"
    puts "Source bot: #{bot.name}"
    puts "Templates exported: #{templates.length}"
  end

  def split_env_list(name)
    ENV.fetch(name, '').split(',').map(&:strip).reject(&:blank?)
  end
end

class BotTemplateExport
  DEFAULT_CATEGORY = 'activity'
  NODE_TYPE_PREFIXES = {
    'condition' => 'condition',
    'action' => 'action',
    'organizer' => 'organizer'
  }.freeze

  def initialize(bot:, config:, organizer_ids:, organizer_titles:)
    @bot = bot
    @config = config
    @organizer_ids = organizer_ids
    @organizer_titles = organizer_titles
    @nodes = bot.nodes.index_by(&:id)
    @connections = Connection
      .where(source_node_id: bot.nodes.select(:id))
      .order(:id)
      .to_a
    @children_by_source = @connections.group_by(&:source_node_id)
  end

  def templates
    selected_organizers.map { |organizer| template_for(organizer) }
  end

  private

  attr_reader :bot, :config, :organizer_ids, :organizer_titles, :nodes, :connections, :children_by_source

  def selected_organizers
    configured = configured_organizers
    return configured if configured.any?
    return organizers_by_ids if organizer_ids.any?
    return organizers_by_titles if organizer_titles.any?

    titled_organizers
  end

  def configured_organizers
    Array(config['organizers']).filter_map do |entry|
      if entry['id'].present?
        organizer = nodes.fetch(entry['id'].to_i)
        validate_organizer!(organizer)
        organizer
      elsif source_title(entry).present?
        organizer_by_title!(source_title(entry))
      elsif entry['title'].present?
        organizer_by_title!(entry['title'])
      end
    end
  end

  def organizers_by_ids
    organizer_ids.map do |id|
      organizer = nodes.fetch(id)
      validate_organizer!(organizer)
      organizer
    end
  end

  def organizers_by_titles
    organizer_titles.map { |title| organizer_by_title!(title) }
  end

  def titled_organizers
    nodes
      .values
      .select { |node| organizer?(node) && organizer_title(node).present? }
      .sort_by { |node| [node.position_y, node.position_x, node.id] }
  end

  def organizer_by_title!(title)
    matches = titled_organizers.select { |node| organizer_title(node) == title }
    raise "No organizer titled #{title.inspect} in bot #{bot.name.inspect}." if matches.empty?
    if matches.length > 1
      ids = matches.map(&:id).join(', ')
      raise "Multiple organizers titled #{title.inspect}; select by ORGANIZER_IDS instead. Matching ids: #{ids}."
    end

    matches.first
  end

  def validate_organizer!(node)
    raise "Node #{node.id} is not an organizer." unless organizer?(node)
  end

  def organizer?(node)
    node&.node_type == 'organizer'
  end

  def organizer_title(node)
    node.data.fetch('title', '').to_s.strip
  end

  def config_for(organizer)
    Array(config['organizers']).find do |entry|
      entry['id'].to_i == organizer.id ||
        source_title(entry).presence == organizer_title(organizer) ||
        entry['title'].presence == organizer_title(organizer)
    end || {}
  end

  def source_title(entry)
    entry['source_title'].presence || entry['sourceTitle'].presence
  end

  def template_for(organizer)
    branch_nodes = branch_nodes_for(organizer)
    node_key_by_id = branch_nodes.to_h { |node| [node.id, node_key(node)] }
    config_entry = config_for(organizer)
    template_name = config_entry['name'].presence || config_entry['title'].presence || organizer_title(organizer)

    {
      id: config_entry['template_id'].presence || "#{parameterized_identifier(template_name)}-#{organizer.id}",
      name: template_name,
      category: config_entry['category'].presence || DEFAULT_CATEGORY,
      description: config_entry['description'].presence || "TODO: describe #{template_name}.",
      nodes: branch_nodes.map { |node| exported_node(node, organizer, node_key_by_id.fetch(node.id), template_name) },
      connections: exported_connections(branch_nodes, node_key_by_id)
    }
  end

  def branch_nodes_for(organizer)
    visited = {}
    result = []
    queue = [organizer.id]

    until queue.empty?
      node_id = queue.shift
      next if visited[node_id]

      node = nodes.fetch(node_id)
      visited[node_id] = true
      result << node

      children_by_source.fetch(node_id, []).each do |connection|
        child = nodes.fetch(connection.target_node_id)
        next if organizer?(child) && child.id != organizer.id

        queue << child.id
      end
    end

    result.sort_by { |node| [node.id == organizer.id ? 0 : 1, node.position_y, node.position_x, node.id] }
  end

  def node_key(node)
    return 'organizer' if organizer?(node)

    "#{NODE_TYPE_PREFIXES.fetch(node.node_type, 'node')}_#{node.id}"
  end

  def exported_node(node, organizer, key, template_name)
    data = node.data.deep_dup
    if organizer?(node)
      data['title'] = template_name
      data['notes'] ||= ''
    end

    {
      key:,
      type: node.node_type,
      position: {
        x: node.position_x - organizer.position_x,
        y: node.position_y - organizer.position_y
      },
      data:
    }
  end

  def exported_connections(branch_nodes, node_key_by_id)
    included_ids = branch_nodes.map(&:id).to_set

    connections
      .select { |connection| included_ids.include?(connection.source_node_id) && included_ids.include?(connection.target_node_id) }
      .map do |connection|
        {
          source: node_key_by_id.fetch(connection.source_node_id),
          target: node_key_by_id.fetch(connection.target_node_id)
        }
      end
  end

  def parameterized_identifier(value)
    value
      .downcase
      .gsub(/[^a-z0-9]+/, '-')
      .gsub(/\A-+|-+\z/, '')
  end
end

module BotTemplateExportRenderer
  module_function

  CATEGORY_CONSTANTS = {
    'opening' => 'OPENING',
    'captures' => 'CAPTURES',
    'defense' => 'DEFENSE',
    'safety' => 'DEFENSE',
    'activity' => 'ACTIVITY',
    'tactics' => 'TACTICS',
    'king_pressure' => 'KING_PRESSURE',
    'king-pressure' => 'KING_PRESSURE',
    'pawn_play' => 'PAWN_PLAY',
    'pawn-play' => 'PAWN_PLAY',
    'endgame' => 'ENDGAME'
  }.freeze

  def render(templates)
    [
      "import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'",
      '',
      'export const EXPORTED_TEMPLATES = [',
      indent(templates.map { |template| render_template(template) }.join(",\n"), 2),
      ']',
      ''
    ].join("\n")
  end

  def render_template(template)
    lines = []
    lines << '{'
    lines << "  id: #{js_string(template.fetch(:id))},"
    lines << "  name: #{js_string(template.fetch(:name))},"
    lines << "  category: #{category_expression(template.fetch(:category))},"
    lines << "  description: #{js_string(template.fetch(:description))},"
    lines << "  nodes: #{render_array(template.fetch(:nodes))},"
    lines << "  connections: #{render_array(template.fetch(:connections))}"
    lines << '}'
    lines.join("\n")
  end

  def render_array(value)
    json_to_js(JSON.pretty_generate(value))
  end

  def category_expression(category)
    constant = CATEGORY_CONSTANTS.fetch(category.to_s) do
      category.to_s.upcase.gsub(/[^A-Z0-9]+/, '_')
    end
    "TEMPLATE_CATEGORIES.#{constant}"
  end

  def json_to_js(json)
    json.gsub(/"([^"]+)":/) { "#{$1}:" }
  end

  def js_string(value)
    JSON.generate(value.to_s)
  end

  def indent(text, spaces)
    prefix = ' ' * spaces
    text.lines.map { |line| "#{prefix}#{line}" }.join.rstrip
  end
end
