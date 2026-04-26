# frozen_string_literal: true

require 'pp'

namespace :bots do
  desc 'Dump an existing bot graph from the DB into a seed file. Usage: rake "bots:dump_seed_file[source_name,target_file]" TARGET_NAME="Phoenix v2" TARGET_DESCRIPTION="..."'
  task :dump_seed_file, [:source_name, :target_file] => :environment do |_task, args|
    source_name = args[:source_name].presence || ENV['SOURCE_NAME'].presence
    target_file = args[:target_file].presence || ENV['TARGET_FILE'].presence

    abort 'Provide SOURCE_NAME or the first rake arg.' if source_name.blank?
    abort 'Provide TARGET_FILE or the second rake arg.' if target_file.blank?

    bot = Bot.find_by(name: source_name)
    abort "Could not find bot #{source_name.inspect}." unless bot

    target_name = ENV['TARGET_NAME'].presence || bot.name
    target_description = ENV['TARGET_DESCRIPTION'].presence || bot.description.to_s

    file_contents = SeedBotDump.build(
      bot:,
      target_name:,
      target_description:
    )

    output_path = Rails.root.join(target_file)
    File.write(output_path, file_contents)

    puts "Wrote #{output_path}"
    puts "Source bot: #{bot.name}"
    puts "Target bot name in seed: #{target_name}"
    puts "Nodes dumped: #{bot.nodes.where.not(node_type: 'root').count}"
    puts "Connections dumped: #{Connection.where(source_node_id: bot.nodes.select(:id)).count}"
  end
end

module SeedBotDump
  module_function

  def build(bot:, target_name:, target_description:)
    root = bot.root_node
    nodes = bot.nodes.where.not(node_type: 'root').order(:id)
    connections = Connection.where(source_node_id: bot.nodes.select(:id)).order(:id)
    variable_name = underscored_identifier(target_name)

    lines = []
    lines << "# Standalone seed file for #{target_name}."
    lines << ''
    lines << "require_relative 'helpers'"
    lines << ''
    lines << 'user = seed_user!'
    lines << ''
    lines << "#{variable_name} = user.bots.find_or_initialize_by(name: #{target_name.inspect})"
    lines << "#{variable_name}.description = #{target_description.inspect}"
    lines << "#{variable_name}.save!"
    lines << ''
    lines << "reset_bot_graph!(#{variable_name})"
    lines << ''
    lines << "node_map = { #{root.id} => #{variable_name}.root_node }"
    lines << ''

    nodes.each do |node|
      lines.concat(node_lines(node:, variable_name:))
      lines << ''
    end

    connections.each do |connection|
      lines << "connect!(node_map[#{connection.source_node_id}], node_map[#{connection.target_node_id}])"
    end

    lines << ''
    lines << "#{variable_name}.compile_program!"
    lines << ''
    lines.join("\n")
  end

  def node_lines(node:, variable_name:)
    case node.node_type
    when 'organizer'
      [
        "node_map[#{node.id}] = create_organizer!(",
        "  bot: #{variable_name},",
        "  position_x: #{node.position_x.inspect},",
        "  position_y: #{node.position_y.inspect},",
        "  title: #{node.data.fetch('title').inspect},",
        "  notes: #{node.data.fetch('notes', '').inspect}",
        ')'
      ]
    when 'condition'
      [
        "node_map[#{node.id}] = create_condition!(",
        "  bot: #{variable_name},",
        "  position_x: #{node.position_x.inspect},",
        "  position_y: #{node.position_y.inspect},",
        '  data: ' + indent(serialized_hash(node.data), 2).lstrip,
        ')'
      ]
    when 'score'
      [
        "node_map[#{node.id}] = create_score!(",
        "  bot: #{variable_name},",
        "  position_x: #{node.position_x.inspect},",
        "  position_y: #{node.position_y.inspect},",
        "  action_type: #{node.data.fetch('actionType').inspect},",
        "  value: #{node.data.fetch('value').inspect}",
        ')'
      ]
    else
      raise "Unsupported node type for seed dump: #{node.node_type.inspect}"
    end
  end

  def serialized_hash(hash)
    PP.pp(hash, +'').chomp
  end

  def indent(text, spaces)
    prefix = ' ' * spaces
    text.lines.map { |line| "#{prefix}#{line}" }.join
  end

  def underscored_identifier(name)
    normalized = name.downcase.gsub(/[^a-z0-9]+/, '_').gsub(/\A_+|_+\z/, '')
    normalized = "bot_#{normalized}" unless normalized.match?(/\A[a-z_]/)
    normalized
  end
end
