# frozen_string_literal: true

class BotCompiler
  include NodeSortOrder

  class InfiniteLoopError < StandardError
    attr_reader :cycle_path
    def initialize(cycle_path)
      @cycle_path = cycle_path
      super("Infinite loop detected while compiling bot graph: #{cycle_path.join(' -> ')}")
    end
  end

  NodeSnapshot = Struct.new(:id, :node_type, :position_x, :position_y, :data, :bot_id)

  PROGRAM_VERSION = 1

  def initialize(bot, node_dimensions = ApplicationHelper::NODE_DIMENSIONS)
    @bot = bot
    @node_dimensions = node_dimensions
    @nodes = load_nodes_as_structs
    @connections = preload_connections
    @compiled_nodes = {}
    @compilation_stack = []
  end

  def compile
    root = @bot.root_node
    raise "Bot has no root node" unless root
    @compiled_nodes = {}
    @compilation_stack = []
    compile_node(root.id)
    {
      version: PROGRAM_VERSION,
      root: root.id.to_s,
      nodes: @compiled_nodes
    }
  end

  private

  def load_nodes_as_structs
    @bot.nodes.pluck(:id, :node_type, :position_x, :position_y, :data, :bot_id)
        .map { |attrs| NodeSnapshot.new(*attrs) }
        .index_by(&:id)
  end

  def preload_connections
    connections = Hash.new { |hash, key| hash[key] = [] }
    Connection.where(source_node_id: @nodes.keys)
      .pluck(:source_node_id, :target_node_id)
      .each do |source_id, target_id|
        connections[source_id] << target_id
      end
    connections
  end

  def compile_node(node_id)
    return @compiled_nodes[node_id.to_s] if @compiled_nodes.key?(node_id.to_s)

    if @compilation_stack.include?(node_id)
      cycle_start = @compilation_stack.index(node_id)
      cycle_path = (@compilation_stack[cycle_start..] + [node_id]).map(&:to_s)
      raise InfiniteLoopError.new(cycle_path)
    end

    node = @nodes[node_id]
    return nil unless node

    @compilation_stack << node_id

    child_ids = sort_children(node_id, @nodes, @connections, @node_dimensions)
    child_ids.each { |child_id| compile_node(child_id) }

    compiled = {
      id: node.id.to_s,
      type: node.node_type,
      data: normalize_data(node),
      children: child_ids.map(&:to_s)
    }

    @compiled_nodes[node_id.to_s] = compiled
    compiled
  ensure
    @compilation_stack.pop if @compilation_stack.last == node_id
  end

  def normalize_data(node)
    raw = node.data.is_a?(Hash) ? node.data : {}

    case node.node_type
    when 'condition'
      kind = raw['kind'] || raw[:kind]

      case kind
      when 'census'
        # Unary shape plus optional region keys; compact drops absent ones.
        {
          version: 2,
          kind: 'census',
          subject: raw['subject'] || raw[:subject],
          subjectFilter: raw['subjectFilter'] || raw[:subjectFilter],
          subjectFilterMode: raw['subjectFilterMode'] || raw[:subjectFilterMode],
          operator: raw['operator'] || raw[:operator],
          comparator: raw['comparator'] || raw[:comparator],
          target: raw['target'] || raw[:target],
          targetFilter: raw['targetFilter'] || raw[:targetFilter],
          targetFilterMode: raw['targetFilterMode'] || raw[:targetFilterMode],
          targetTotal: hash_value(raw, 'targetTotal'),
          positionAxis: raw['positionAxis'] || raw[:positionAxis],
          positionComparator: raw['positionComparator'] || raw[:positionComparator],
          positionTarget: hash_value(raw, 'positionTarget')
        }.compact
      when 'identity'
        {
          version: 2,
          kind: 'identity',
          subject: raw['subject'] || raw[:subject],
          target: raw['target'] || raw[:target]
        }.compact
      when 'relational'
        {
          version: 2,
          kind: 'relational',
          subject: raw['subject'] || raw[:subject],
          subjectFilter: raw['subjectFilter'] || raw[:subjectFilter],
          subjectFilterMode: raw['subjectFilterMode'] || raw[:subjectFilterMode],
          subjectComparisonMetric: raw['subjectComparisonMetric'] || raw[:subjectComparisonMetric],
          subjectComparator: raw['subjectComparator'] || raw[:subjectComparator],
          subjectComparisonSource: raw['subjectComparisonSource'] || raw[:subjectComparisonSource],
          subjectComparisonSourceTotal: hash_value(raw, 'subjectComparisonSourceTotal'),
          operator: raw['operator'] || raw[:operator],
          target: raw['target'] || raw[:target],
          targetFilter: raw['targetFilter'] || raw[:targetFilter],
          targetFilterMode: raw['targetFilterMode'] || raw[:targetFilterMode],
          targetComparisonMetric: raw['targetComparisonMetric'] || raw[:targetComparisonMetric],
          targetComparator: raw['targetComparator'] || raw[:targetComparator],
          targetComparisonSource: raw['targetComparisonSource'] || raw[:targetComparisonSource],
          targetComparisonSourceTotal: hash_value(raw, 'targetComparisonSourceTotal')
        }.compact
      else
        raw
      end
    when 'score'
      {
        actionType: raw['actionType'] || raw[:actionType],
        value: raw['value'] || raw[:value]
      }
    else
      # Organizers carry freeform user-authored text. We intentionally strip that
      # data out during compilation so annotation content never becomes part of the
      # executable bot program. The title is included as display metadata for trace rendering.
      { title: raw['title'] || raw[:title] || '' }
    end
  end

  def hash_value(hash, key)
    hash.key?(key) ? hash[key] : hash[key.to_sym]
  end

end
