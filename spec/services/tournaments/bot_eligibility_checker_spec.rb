# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tournaments::BotEligibilityChecker do
  def program(*node_defs)
    nodes = node_defs.each_with_object({}) do |n, h|
      h[n[:id]] = n.stringify_keys.merge("children" => n.fetch(:children, []))
    end
    { "version" => 1, "root" => node_defs.first[:id], "nodes" => nodes }
  end

  def node(id, type, children: [], **data_fields)
    { id: id, type: type, children: children, "data" => data_fields.stringify_keys }
  end

  def condition(id, kind: "unary", children: [], **fields)
    node(id, "condition", children: children, kind: kind, **fields)
  end

  def score(id, action_type: "add", value: 1, children: [])
    node(id, "score", children: children, actionType: action_type, value: value)
  end

  def root(id, children: [])
    node(id, "root", children: children)
  end

  def organizer(id, children: [])
    node(id, "organizer", children: children)
  end

  def check(prog, constraints = nil)
    described_class.new(prog, constraints).check
  end

  # root → condition → score
  let(:linear_program) do
    program(
      root("r", children: ["c1"]),
      condition("c1", children: ["s1"]),
      score("s1")
    )
  end

  describe "with nil constraints" do
    it "is always eligible" do
      result = check(linear_program, nil)
      expect(result.eligible).to be true
      expect(result.violations).to be_empty
    end

    it "returns cost 0 and nil budget" do
      result = check(linear_program, nil)
      expect(result.cost).to eq(0)
      expect(result.budget).to be_nil
    end

    it "populates all stats keys" do
      result = check(linear_program, nil)
      expect(result.stats.keys).to contain_exactly(:and_count, :or_count, :score_node_count, :max_branch_length)
    end
  end

  describe "OR counting" do
    # root → c1 → s1
    #       → c2 → s1   (s1 has two parents)
    let(:or_program) do
      program(
        root("r", children: ["c1", "c2"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
    end

    it "counts a node with 2 parents as 1 OR" do
      expect(check(or_program).stats[:or_count]).to eq(1)
    end

    # root → c1 → s1
    #       → c2 → s1
    #       → c3 → s1   (s1 has three parents = 2 ORs)
    it "counts a node with 3 parents as 2 ORs" do
      prog = program(
        root("r", children: ["c1", "c2", "c3"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["s1"]),
        condition("c3", children: ["s1"]),
        score("s1")
      )
      expect(check(prog).stats[:or_count]).to eq(2)
    end

    it "does not count a fork that never reconverges as an OR" do
      # root → c1 → s1
      #       → c2 → s2   (two paths never meet)
      prog = program(
        root("r", children: ["c1", "c2"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["s2"]),
        score("s1"),
        score("s2")
      )
      expect(check(prog).stats[:or_count]).to eq(0)
    end

    it "counts an OR through an organizer" do
      # root → o1 → s1
      #       → o2 → s1   (s1 still has two parents)
      prog = program(
        root("r", children: ["o1", "o2"]),
        organizer("o1", children: ["s1"]),
        organizer("o2", children: ["s1"]),
        score("s1")
      )
      expect(check(prog).stats[:or_count]).to eq(1)
    end

    context "when allow_or is false" do
      let(:constraints) { { "allow_or" => false } }

      it "adds a violation when ORs are present" do
        result = check(or_program, constraints)
        expect(result.eligible).to be false
        expect(result.violations).to include(include(type: "allow_or"))
      end

      it "is eligible when no ORs are present" do
        expect(check(linear_program, constraints).eligible).to be true
      end
    end
  end

  describe "AND counting" do
    # root → c1 → c2 → s1   (c1 has one condition child = 1 AND)
    let(:and_program) do
      program(
        root("r", children: ["c1"]),
        condition("c1", children: ["c2"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
    end

    it "counts one condition child as 1 AND" do
      expect(check(and_program).stats[:and_count]).to eq(1)
    end

    it "counts two condition children as 2 ANDs" do
      prog = program(
        root("r", children: ["c1"]),
        condition("c1", children: ["c2", "c3"]),
        condition("c2", children: ["s1"]),
        condition("c3", children: ["s1"]),
        score("s1")
      )
      # c1 has 2 condition children; c2 and c3 have no condition children
      # s1 has 2 parents → 1 OR (separate from AND count)
      expect(check(prog).stats[:and_count]).to eq(2)
    end

    it "does not count an organizer child as an AND" do
      prog = program(
        root("r", children: ["c1"]),
        condition("c1", children: ["o1"]),
        organizer("o1", children: ["c2"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
      expect(check(prog).stats[:and_count]).to eq(0)
    end

    it "does not count a score child as an AND" do
      expect(check(linear_program).stats[:and_count]).to eq(0)
    end

    context "when allow_and is false" do
      let(:constraints) { { "allow_and" => false } }

      it "adds a violation when ANDs are present" do
        result = check(and_program, constraints)
        expect(result.eligible).to be false
        expect(result.violations).to include(include(type: "allow_and"))
      end

      it "is eligible when no ANDs are present" do
        expect(check(linear_program, constraints).eligible).to be true
      end
    end
  end

  describe "branch length" do
    it "counts only condition nodes on the longest root-to-leaf path" do
      # root → organizer → c1 → c2 → score
      # branch length = 2 (c1, c2); organizer and root don't count
      prog = program(
        root("r", children: ["o1"]),
        organizer("o1", children: ["c1"]),
        condition("c1", children: ["c2"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
      expect(check(prog).stats[:max_branch_length]).to eq(2)
    end

    it "returns the longest path when branches diverge" do
      # root → c1 → s1           (depth 1)
      #       → c2 → c3 → s2     (depth 2)
      prog = program(
        root("r", children: ["c1", "c2"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["c3"]),
        condition("c3", children: ["s2"]),
        score("s1"),
        score("s2")
      )
      expect(check(prog).stats[:max_branch_length]).to eq(2)
    end

    it "is 0 for a program with no condition nodes" do
      prog = program(root("r", children: ["s1"]), score("s1"))
      expect(check(prog).stats[:max_branch_length]).to eq(0)
    end

    context "with max_branch_length constraint" do
      it "adds a violation when exceeded" do
        # c1 → c2 → c3 = length 3
        prog = program(
          root("r", children: ["c1"]),
          condition("c1", children: ["c2"]),
          condition("c2", children: ["c3"]),
          condition("c3", children: ["s1"]),
          score("s1")
        )
        result = check(prog, { "max_branch_length" => 2 })
        expect(result.eligible).to be false
        expect(result.violations).to include(include(type: "max_branch_length"))
      end

      it "is eligible when exactly at the limit" do
        prog = program(
          root("r", children: ["c1"]),
          condition("c1", children: ["c2"]),
          condition("c2", children: ["s1"]),
          score("s1")
        )
        expect(check(prog, { "max_branch_length" => 2 }).eligible).to be true
      end
    end
  end

  describe "score node count" do
    it "counts all score nodes" do
      prog = program(
        root("r", children: ["c1", "c2"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["s2"]),
        score("s1"),
        score("s2")
      )
      expect(check(prog).stats[:score_node_count]).to eq(2)
    end

    context "with max_score_nodes constraint" do
      it "adds a violation when exceeded" do
        prog = program(
          root("r", children: ["c1", "c2"]),
          condition("c1", children: ["s1"]),
          condition("c2", children: ["s2"]),
          score("s1"),
          score("s2")
        )
        result = check(prog, { "max_score_nodes" => 1 })
        expect(result.eligible).to be false
        expect(result.violations).to include(include(type: "max_score_nodes"))
      end

      it "is eligible when exactly at the limit" do
        expect(check(linear_program, { "max_score_nodes" => 1 }).eligible).to be true
      end
    end
  end

  describe "budget" do
    let(:costs) do
      {
        "score_node"           => 2,
        "unary_condition"      => 3,
        "relational_condition" => 5,
        "and"                  => 1,
        "or"                   => 4
      }
    end

    it "sums costs by node type and kind" do
      # 1 unary condition (3) + 1 score node (2) = 5
      result = check(linear_program, { "costs" => costs })
      expect(result.cost).to eq(5)
    end

    it "charges and_cost per AND edge" do
      # c1 → c2 (1 AND), each is unary (3 each), 1 score (2) → 3+3+2+1 = 9
      prog = program(
        root("r", children: ["c1"]),
        condition("c1", children: ["c2"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
      expect(check(prog, { "costs" => costs }).cost).to eq(9)
    end

    it "charges or_cost per OR" do
      # two conditions (3 each) converge on one score (2), 1 OR (4) → 3+3+2+4 = 12
      prog = program(
        root("r", children: ["c1", "c2"]),
        condition("c1", children: ["s1"]),
        condition("c2", children: ["s1"]),
        score("s1")
      )
      expect(check(prog, { "costs" => costs }).cost).to eq(12)
    end

    it "uses the kind-specific cost for relational conditions" do
      prog = program(
        root("r", children: ["c1"]),
        condition("c1", kind: "relational", children: ["s1"]),
        score("s1")
      )
      # relational (5) + score (2) = 7
      expect(check(prog, { "costs" => costs }).cost).to eq(7)
    end

    it "skips cost keys that are nil" do
      # Only score_node cost set; condition has no cost
      result = check(linear_program, { "costs" => { "score_node" => 10 } })
      expect(result.cost).to eq(10)
    end

    it "adds a budget violation when cost exceeds budget" do
      result = check(linear_program, { "costs" => costs, "budget" => 4 })
      expect(result.eligible).to be false
      expect(result.violations).to include(include(type: "budget"))
    end

    it "is eligible when cost equals budget" do
      # 1 unary (3) + 1 score (2) = 5
      expect(check(linear_program, { "costs" => costs, "budget" => 5 }).eligible).to be true
    end
  end

  describe "score_node_restrictions" do
    context "with banned_action_types" do
      it "is eligible when no score nodes use a banned type" do
        result = check(linear_program, { "score_node_restrictions" => { "banned_action_types" => ["return"] } })
        expect(result.eligible).to be true
      end

      it "aggregates one violation per banned action type with a node count" do
        prog = program(
          root("r", children: ["c1", "c2"]),
          condition("c1", children: ["s1"]),
          condition("c2", children: ["s2"]),
          score("s1", action_type: "return"),
          score("s2", action_type: "return")
        )
        result = check(prog, { "score_node_restrictions" => { "banned_action_types" => ["return"] } })
        violations = result.violations.select { |v| v[:type] == "score_node_action_type" }
        expect(violations.size).to eq(1)
        expect(violations.first[:message]).to include("return").and include("2 nodes")
      end

      it "is eligible with no banned types set" do
        result = check(linear_program, { "score_node_restrictions" => {} })
        expect(result.eligible).to be true
      end
    end
  end

  describe "condition_restrictions" do
    context "with banned_kinds" do
      it "adds a violation for a condition using a banned kind" do
        prog = program(
          root("r", children: ["c1"]),
          condition("c1", kind: "relational", children: ["s1"]),
          score("s1")
        )
        result = check(prog, { "condition_restrictions" => { "banned_kinds" => ["relational"] } })
        expect(result.violations).to include(include(type: "condition_kind"))
      end

      it "is eligible when no conditions use a banned kind" do
        result = check(linear_program, { "condition_restrictions" => { "banned_kinds" => ["relational"] } })
        expect(result.eligible).to be true
      end

      it "is eligible with no banned kinds set" do
        result = check(linear_program, { "condition_restrictions" => {} })
        expect(result.eligible).to be true
      end
    end

    context "with kind-specific field restrictions" do
      let(:prog) do
        program(
          root("r", children: ["c1"]),
          condition("c1", kind: "unary", subject: "moved_piece", operator: "value", children: ["s1"]),
          score("s1")
        )
      end

      it "adds a violation for a disallowed subject" do
        constraints = { "condition_restrictions" => { "unary" => { "allowed_subjects" => ["last_moved_piece"] } } }
        result = check(prog, constraints)
        expect(result.violations).to include(include(type: "condition_subject"))
      end

      it "adds a violation for a disallowed operator" do
        constraints = { "condition_restrictions" => { "unary" => { "allowed_operators" => ["control"] } } }
        result = check(prog, constraints)
        expect(result.violations).to include(include(type: "condition_operator"))
      end

      it "is eligible when all fields are within allowed lists" do
        constraints = { "condition_restrictions" => { "unary" => { "allowed_subjects" => ["moved_piece"], "allowed_operators" => ["value"] } } }
        expect(check(prog, constraints).eligible).to be true
      end

      it "does not apply kind-specific rules to conditions of a different kind" do
        # relational condition; unary rules should not apply
        prog2 = program(
          root("r", children: ["c1"]),
          condition("c1", kind: "relational", subject: "moved_piece", operator: "attacks", children: ["s1"]),
          score("s1")
        )
        constraints = { "condition_restrictions" => { "unary" => { "allowed_subjects" => ["last_moved_piece"] } } }
        expect(check(prog2, constraints).eligible).to be true
      end
    end
  end

  describe "multiple violations" do
    it "accumulates all violations in one pass" do
      prog = program(
        root("r", children: ["c1"]),
        condition("c1", kind: "relational", children: ["s1"]),
        score("s1", action_type: "return")
      )
      constraints = {
        "condition_restrictions" => { "banned_kinds" => ["relational"] },
        "score_node_restrictions" => { "banned_action_types" => ["return"] }
      }
      result = check(prog, constraints)
      expect(result.eligible).to be false
      expect(result.violations.map { |v| v[:type] }).to contain_exactly("condition_kind", "score_node_action_type")
    end
  end
end
