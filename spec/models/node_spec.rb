require 'rails_helper'

RSpec.describe Node, type: :model do
  describe '.condition_preview_chunks' do
    it 'returns structured relational V2 chunks' do
      chunks = described_class.condition_preview_chunks(
        {
          'version' => 2,
          'kind' => 'relational',
          'subject' => 'allied',
          'subjectFilter' => 'queen',
          'subjectFilterMode' => 'include',
          'subjectComparisonMetric' => 'count',
          'subjectComparator' => 'greater_than',
          'subjectComparisonValue' => 2,
          'operator' => 'attack',
          'target' => 'enemy',
          'targetFilter' => 'any',
          'targetComparisonMetric' => 'value',
          'targetComparator' => 'less_than',
          'targetComparisonValue' => 'prior_board_state'
        }
      )

      expect(chunks).to match(
        [
          include(
            role: 'side',
            subject: 'allied',
            filter: 'queen',
            filter_mode: 'include',
            comparison_metric: 'count',
            comparator: 'greater_than',
            comparison_value: 2
          ),
          { role: 'spacer' },
          include(role: 'operator', operator: 'attack'),
          { role: 'spacer' },
          include(
            role: 'side',
            subject: 'enemy',
            filter: 'any',
            filter_mode: nil,
            comparison_metric: 'value',
            comparator: 'less_than',
            comparison_value: 'prior_board_state'
          )
        ]
      )
    end

    it 'returns structured unary V2 chunks' do
      chunks = described_class.condition_preview_chunks(
        {
          'version' => 2,
          'kind' => 'unary',
          'subject' => 'enemy_moved_piece',
          'subjectFilter' => 'pawn',
          'subjectFilterMode' => 'include',
          'operator' => 'value',
          'comparator' => 'equal_to',
          'comparisonValue' => 'captured_piece_value'
        }
      )

      expect(chunks).to match(
        [
          include(
            role: 'side',
            subject: 'enemy_moved_piece',
            filter: 'pawn',
            filter_mode: 'include',
            comparison_metric: nil,
            comparator: nil,
            comparison_value: nil
          ),
          { role: 'spacer' },
          include(role: 'operator', operator: 'value'),
          { role: 'spacer' },
          include(
            role: 'comparison',
            comparator: 'equal_to',
            comparison_value: 'captured_piece_value'
          )
        ]
      )
    end

    it 'keeps V1 chunks as plain strings' do
      chunks = described_class.condition_preview_chunks(
        {
          'subject' => 'moved_piece',
          'subjectSpecifier' => 'any',
          'relation' => 'attacker',
          'relationSpecifier' => 'any',
          'comparison' => 'greater_than',
          'comparisonValue' => 0
        }
      )

      expect(chunks).to all(be_a(String))
    end
  end

  describe 'validations' do
    it 'is valid with a node_type' do
      node = build(:node)
      expect(node).to be_valid
    end

    it 'is invalid without a node_type' do
      node = build(:node, node_type: nil)
      expect(node).not_to be_valid
      expect(node.errors[:node_type]).to include("can't be blank")
    end

    it 'is valid with position_x and position_y' do
      node = build(:node, position_x: 150.5, position_y: 200.0)
      expect(node).to be_valid
    end

    it 'has default position values' do
      node = Node.new(node_type: 'condition', bot: create(:bot))
      expect(node.position_x).to eq(0.0)
      expect(node.position_y).to eq(0.0)
    end

    it 'is valid with empty data hash for organizer nodes' do
      node = build(:node, :organizer, data: {})
      expect(node).to be_valid
    end

    it 'is valid with nil data for organizer nodes' do
      node = build(:node, :organizer, data: nil)
      expect(node).to be_valid
    end

    it 'rejects organizer data with invalid keys' do
      node = build(:node, :organizer, data: {
        title: '',
        notes: '',
        banana: 'crime'
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('contains invalid keys: banana')
    end

    it 'is valid with prototype condition data' do
      node = build(:node, :condition)
      expect(node).to be_valid
    end

    it 'rejects condition data with invalid keys' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0,
        banana: 'crime'
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('contains invalid keys: banana')
    end

    it 'rejects condition data with invalid relation' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacked_after_move',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid relation')
    end

    it 'rejects positional relations for captured_piece conditions' do
      node = build(:node, :condition, data: {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid relation')
    end

    it 'accepts value for captured_piece conditions' do
      node = build(:node, :condition, data: {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 3
      })

      expect(node).to be_valid
    end

    it 'accepts canonical captured_piece relations' do
      node = build(:node, :condition, data: {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 3
      })

      expect(node).to be_valid
    end

    it 'rejects relation specifiers that are invalid for the subject' do
      node = build(:node, :condition, data: {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'pawn',
        comparison: 'greater_than',
        comparisonValue: 3
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid relationSpecifier')
    end

    it 'rejects relation specifiers that are invalid for the relation' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'mobility',
        relationSpecifier: 'pawn',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid relationSpecifier')
    end

    it 'accepts moved_piece as a relation specifier for positional spatial relations' do
      node = build(:node, :condition, data: {
        subject: 'allies',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'moved_piece',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).to be_valid
    end

    it 'accepts exclude mode for subject and relation specifiers' do
      node = build(:node, :condition, data: {
        subject: 'allies',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'exclude',
        relation: 'attacker',
        relationSpecifier: 'pawn',
        relationSpecifierMode: 'exclude',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).to be_valid
    end

    it 'rejects exclude mode for subjectSpecifier any' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        subjectSpecifierMode: 'exclude',
        relation: 'attacker',
        relationSpecifier: 'any',
        relationSpecifierMode: 'include',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid subjectSpecifierMode for subjectSpecifier')
    end

    it 'rejects exclude mode for relationSpecifier any' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'include',
        relation: 'attacker',
        relationSpecifier: 'any',
        relationSpecifierMode: 'exclude',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid relationSpecifierMode for relationSpecifier')
    end

    it 'rejects prior_board_state for captured_piece conditions' do
      node = build(:node, :condition, data: {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid comparisonValue')
    end

    it 'accepts prior_board_state for positional conditions' do
      node = build(:node, :condition, data: {
        subject: 'allies',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      })

      expect(node).to be_valid
    end

    it 'requires comparisonValue for all comparisons' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: nil
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid comparisonValue')
    end

    it 'allows comparisonValue for less_than comparisons' do
      node = build(:node, :condition, data: {
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'shielder',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      })

      expect(node).to be_valid
    end

    it 'is valid with prototype action data' do
      node = build(:node, :action)
      expect(node).to be_valid
    end

    it 'rejects action data with invalid keys' do
      node = build(:node, :action, data: { actionType: 'add', value: 1, bonus: 4 })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('contains invalid keys: bonus')
    end

    it 'rejects action data with invalid actionType' do
      node = build(:node, :action, data: { actionType: 'move', value: 1 })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid actionType')
    end
  end

  describe 'associations' do
    it 'belongs to a bot' do
      bot = create(:bot)
      node = create(:node, bot: bot)
      expect(node.bot).to eq(bot)
    end

    it 'has many outgoing connections' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      connection = Connection.create!(source_node: node1, target_node: node2)
      expect(node1.outgoing_connections).to include(connection)
    end

    it 'has many incoming connections' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      connection = Connection.create!(source_node: node1, target_node: node2)
      expect(node2.incoming_connections).to include(connection)
    end

    it 'destroys dependent outgoing connections when destroyed' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      Connection.create!(source_node: node1, target_node: node2)
      expect { node1.destroy }.to change { Connection.count }.by(-1)
    end

    it 'destroys dependent incoming connections when destroyed' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      Connection.create!(source_node: node1, target_node: node2)
      expect { node2.destroy }.to change { Connection.count }.by(-1)
    end
  end

  describe 'node types' do
    it 'can be a condition node' do
      node = build(:node, :condition)
      expect(node.node_type).to eq('condition')
      expect(node).to be_valid
    end

    it 'can be an action node' do
      node = build(:node, :action)
      expect(node.node_type).to eq('action')
      expect(node).to be_valid
    end

    it 'can be a root node' do
      node = build(:node, :root)
      expect(node.node_type).to eq('root')
      expect(node).to be_valid
    end
  end

  describe 'root node type' do
    describe '#root? helper' do
      it 'returns true for root nodes' do
        node = build(:node, :root)
        expect(node.root?).to be true
      end

      it 'returns false for condition nodes' do
        node = build(:node, :condition)
        expect(node.root?).to be false
      end

      it 'returns false for action nodes' do
        node = build(:node, :action)
        expect(node.root?).to be false
      end
    end

    describe 'uniqueness validation' do
      it 'prevents creating second root node for same bot' do
        bot = create(:bot)
        expect(bot.root_node).to be_present

        second_root = build(:node, :root, bot: bot)
        expect(second_root).not_to be_valid
        expect(second_root.errors[:node_type]).to include("bot already has a root node")
      end

      it 'allows updating existing root node without error' do
        bot = create(:bot)
        root = bot.root_node

        root.position_x = 500
        expect(root).to be_valid
        expect { root.save! }.not_to raise_error
      end
    end
  end

end
