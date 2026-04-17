#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "../config/environment"
require "set"
require "json"

bot_name = ARGV[0] or abort "usage: script/analyze_bot_graph.rb 'Bot Name'"

bot = Bot.find_by!(name: bot_name)

NodeSummary = Struct.new(:id, :label, :node_type, keyword_init: true)

def condition_signature(node)
  data = node.data
  [
    "subject=#{data["subject"]}",
    "subject_specifier=#{data["subjectSpecifier"]}",
    "subject_specifier_mode=#{data["subjectSpecifierMode"]}",
    "relation=#{data["relation"]}",
    "relation_specifier=#{data["relationSpecifier"]}",
    "relation_specifier_mode=#{data["relationSpecifierMode"]}",
    "comparison=#{data["comparison"]}",
    "comparison_value=#{data["comparisonValue"]}"
  ].join(" | ")
end

def action_signature(node)
  data = node.data
  "action=#{data["actionType"]}(#{data["value"]})"
end

def node_signature(node)
  case node.node_type
  when "condition"
    "condition:#{condition_signature(node)}"
  when "action"
    "action:#{action_signature(node)}"
  when "organizer"
    "organizer:#{node.data["title"]}"
  else
    "#{node.node_type}:#{node.id}"
  end
end

def node_label(node)
  case node.node_type
  when "condition"
    condition_signature(node)
  when "action"
    action_signature(node)
  when "organizer"
    node.data["title"]
  else
    "#{node.node_type}##{node.id}"
  end
end

def outgoing(node)
  node.outgoing_connections.includes(:target_node).map(&:target_node).sort_by(&:position_x)
end

def organizer_paths(organizer)
  paths = []
  stack = outgoing(organizer).map { |child| [[organizer], child] }

  until stack.empty?
    prefix, node = stack.pop
    current = prefix + [node]

    children = outgoing(node)
    if children.empty?
      paths << current
      next
    end

    children.reverse_each do |child|
      stack << [current, child]
    end
  end

  paths
end

def descendant_paths(start_node)
  paths = []
  stack = outgoing(start_node).map { |child| [[], child] }

  until stack.empty?
    prefix, node = stack.pop
    current = prefix + [node]

    children = outgoing(node)
    if children.empty?
      paths << current
      next
    end

    children.reverse_each do |child|
      stack << [current, child]
    end
  end

  paths
end

def common_prefix_length(paths)
  return 0 if paths.empty?

  min_length = paths.map(&:length).min
  length = 0

  while length < min_length
    signatures = paths.map { |path| node_signature(path[length]) }.uniq
    break if signatures.length > 1
    length += 1
  end

  length
end

def repeated_sibling_groups(node)
  groups = []
  children = outgoing(node)
  return groups if children.length < 2

  runs = []
  current_run = [children.first]

  children.each_cons(2) do |left, right|
    if node_signature(left) == node_signature(right)
      current_run << right
    else
      runs << current_run if current_run.length > 1
      current_run = [right]
    end
  end
  runs << current_run if current_run.length > 1

  runs.each do |run|
    groups << {
      parent: NodeSummary.new(id: node.id, label: node_label(node), node_type: node.node_type),
      repeated_child: node_label(run.first),
      child_ids: run.map(&:id),
      count: run.length
    }
  end

  children.each do |child|
    groups.concat(repeated_sibling_groups(child))
  end

  groups
end

def repeated_prefixes_under_parent(parent, organizer_title)
  paths = descendant_paths(parent)
  return [] if paths.length < 2

  child_positions = outgoing(parent).each_with_index.to_h { |child, index| [child.id, index] }
  buckets = Hash.new { |h, k| h[k] = [] }

  paths.each do |path|
    next if path.empty?

    path.each_index do |idx|
      prefix = path[0..idx]
      key = prefix.map { |node| node_signature(node) }.join(" -> ")
      buckets[key] << path
    end
  end

  buckets.flat_map do |key, bucket_paths|
    next [] if bucket_paths.length < 2

    prefix_len = key.split(" -> ").length
    grouped_by_child = bucket_paths.group_by { |path| path.first.id }
    ordered_child_ids = grouped_by_child.keys.sort_by { |child_id| child_positions.fetch(child_id) }

    current_run = [ordered_child_ids.first]
    runs = []

    ordered_child_ids.each_cons(2) do |left_id, right_id|
      if child_positions.fetch(right_id) == child_positions.fetch(left_id) + 1
        current_run << right_id
      else
        runs << current_run if current_run.length > 1
        current_run = [right_id]
      end
    end
    runs << current_run if current_run.length > 1

    runs.filter_map do |run_child_ids|
      run_paths = run_child_ids.flat_map { |child_id| grouped_by_child.fetch(child_id) }

      suffix_signatures = run_paths.map do |path|
        rest = path[prefix_len]
        rest ? node_signature(rest) : "<terminal>"
      end.uniq
      next if suffix_signatures.length < 2

      {
        organizer: organizer_title,
        parent: NodeSummary.new(id: parent.id, label: node_label(parent), node_type: parent.node_type),
        first_child_ids: run_child_ids,
        prefix_length: prefix_len,
        occurrences: run_paths.length,
        prefix: key
      }
    end
  end
end

def repeated_prefixes_in_subtree(node, organizer_title)
  matches = repeated_prefixes_under_parent(node, organizer_title)
  outgoing(node).each do |child|
    matches.concat(repeated_prefixes_in_subtree(child, organizer_title))
  end
  matches
end

root_children = outgoing(bot.root_node).select { |node| node.node_type == "organizer" }

report = {
  bot: bot.name,
  organizers: [],
  repeated_sibling_groups: [],
  repeated_prefixes: []
}

root_children.each do |organizer|
  paths = organizer_paths(organizer)
  report[:organizers] << {
    organizer: organizer.data["title"],
    path_count: paths.length,
    shared_prefix_length: common_prefix_length(paths.map { |path| path[1..] })
  }
  report[:repeated_sibling_groups].concat(repeated_sibling_groups(organizer))
  report[:repeated_prefixes].concat(repeated_prefixes_in_subtree(organizer, organizer.data["title"]))
end

puts JSON.pretty_generate(report)
