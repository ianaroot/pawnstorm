# frozen_string_literal: true

class BotEligibilityChecker
  def initialize(compiled_program, constraints)
    @nodes = (compiled_program || {}).fetch("nodes", {})
    @root_id = (compiled_program || {})["root"]
    @constraints = constraints || {}
    @costs = @constraints.fetch("costs", {}) || {}
    @score_node_restrictions = @constraints.fetch("score_node_restrictions", {}) || {}
    @condition_restrictions = @constraints.fetch("condition_restrictions", {}) || {}
  end

  def check
    parent_index = build_parent_index

    or_count    = compute_or_count(parent_index)
    and_count   = compute_and_count
    score_nodes = @nodes.values.select { |n| n["type"] == "score" }
    branch_len  = compute_max_branch_length

    violations = []
    check_allow_or(or_count, violations)
    check_allow_and(and_count, violations)
    check_max_score_nodes(score_nodes.size, violations)
    check_max_branch_length(branch_len, violations)
    check_score_node_restrictions(score_nodes, violations)
    check_condition_restrictions(violations)

    cost = compute_cost(or_count, and_count)

    if (budget = @constraints["budget"]) && cost > budget
      violations << { type: "budget", message: "Bot costs #{cost} (budget is #{budget})" }
    end

    {
      eligible: violations.empty?,
      cost: cost,
      budget: @constraints["budget"],
      violations: violations,
      stats: {
        or_count: or_count,
        and_count: and_count,
        score_node_count: score_nodes.size,
        max_branch_length: branch_len
      }
    }
  end

  private

  def build_parent_index
    parent_index = Hash.new(0)
    @nodes.each_value do |node|
      Array(node["children"]).each { |child_id| parent_index[child_id] += 1 }
    end
    parent_index
  end

  def compute_or_count(parent_index)
    parent_index.values.sum { |count| count - 1 }
  end

  def compute_and_count
    @nodes.values.sum do |node|
      next 0 unless node["type"] == "condition"
      Array(node["children"]).count { |child_id| @nodes.dig(child_id, "type") == "condition" }
    end
  end

  def compute_max_branch_length
    return 0 unless @root_id
    dfs_condition_depth(@root_id, Set.new)
  end

  def dfs_condition_depth(node_id, visited)
    return 0 if visited.include?(node_id)
    node = @nodes[node_id]
    return 0 unless node

    own_depth = node["type"] == "condition" ? 1 : 0
    children  = Array(node["children"])
    return own_depth if children.empty?

    child_max = children.map { |child_id| dfs_condition_depth(child_id, visited | [node_id]) }.max
    own_depth + child_max
  end

  def compute_cost(or_count, and_count)
    total = 0

    @nodes.each_value do |node|
      case node["type"]
      when "score"
        total += @costs["score_node"].to_i if @costs["score_node"]
      when "condition"
        kind_cost_key = "#{node.dig("data", "kind")}_condition"
        total += @costs[kind_cost_key].to_i if @costs[kind_cost_key]
      end
    end

    total += @costs["and"].to_i * and_count if @costs["and"]
    total += @costs["or"].to_i  * or_count  if @costs["or"]
    total
  end

  def check_allow_or(or_count, violations)
    return unless @constraints["allow_or"] == false && or_count > 0
    violations << { type: "allow_or", message: "Bot contains #{or_count} OR #{"branch".pluralize(or_count)} (not allowed in this tournament)" }
  end

  def check_allow_and(and_count, violations)
    return unless @constraints["allow_and"] == false && and_count > 0
    violations << { type: "allow_and", message: "Bot contains #{and_count} AND #{"condition".pluralize(and_count)} (not allowed in this tournament)" }
  end

  def check_max_score_nodes(count, violations)
    max = @constraints["max_score_nodes"]
    return unless max && count > max
    violations << { type: "max_score_nodes", message: "Bot has #{count} #{"score node".pluralize(count)} (max #{max})" }
  end

  def check_max_branch_length(length, violations)
    max = @constraints["max_branch_length"]
    return unless max && length > max
    violations << { type: "max_branch_length", message: "Bot's longest branch is #{length} #{"condition".pluralize(length)} deep (max #{max})" }
  end

  def check_score_node_restrictions(score_nodes, violations)
    banned_types = @score_node_restrictions["banned_action_types"]
    return unless banned_types&.any?

    counts = Hash.new(0)
    score_nodes.each do |node|
      action_type = node.dig("data", "actionType")
      counts[action_type] += 1 if banned_types.include?(action_type)
    end
    counts.each do |action_type, count|
      violations << { type: "score_node_action_type", message: "Bot uses banned score action type '#{action_type}' (#{count} #{"node".pluralize(count)})" }
    end
  end

  def check_condition_restrictions(violations)
    banned_kinds = @condition_restrictions["banned_kinds"]
    kind_counts = Hash.new(0)

    @nodes.each_value do |node|
      next unless node["type"] == "condition"
      kind = node.dig("data", "kind")

      if banned_kinds&.include?(kind)
        kind_counts[kind] += 1
        next
      end

      check_kind_restrictions(kind, node, violations)
    end

    kind_counts.each do |kind, count|
      violations << { type: "condition_kind", message: "Bot uses banned condition kind '#{kind}' (#{count} #{"node".pluralize(count)})" }
    end
  end

  def check_kind_restrictions(kind, node, violations)
    kind_rules = @condition_restrictions[kind]
    return unless kind_rules

    if (allowed = kind_rules["allowed_subjects"])
      subject = node.dig("data", "subject")
      unless allowed.include?(subject)
        violations << { type: "condition_subject", message: "Bot uses subject '#{subject}' in #{kind} condition (not allowed in this tournament)" }
      end
    end

    if (allowed = kind_rules["allowed_operators"])
      operator = node.dig("data", "operator")
      unless allowed.include?(operator)
        violations << { type: "condition_operator", message: "Bot uses operator '#{operator}' in #{kind} condition (not allowed in this tournament)" }
      end
    end

    if (allowed = kind_rules["allowed_targets"])
      target = node.dig("data", "target")
      unless allowed.include?(target)
        violations << { type: "condition_target", message: "Bot uses target '#{target}' in #{kind} condition (not allowed in this tournament)" }
      end
    end

    # allowed_comparisons: skeleton — structure recognized, enforcement deferred
  end
end
