require 'rails_helper'

RSpec.describe Node, type: :model do
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

    it 'rejects unknown node types' do
      node = build(:node, node_type: 'banana')

      expect(node).not_to be_valid
      expect(node.errors[:node_type]).to include('is not included in the list')
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
        version: 2,
        kind: 'census',
        subject: 'moved_piece',
        subjectFilter: 'any',
        subjectFilterMode: 'include',
        operator: 'value',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0,
        banana: 'crime'
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('contains invalid keys: banana')
    end

    it 'rejects legacy V1 condition data for persisted nodes' do
      node = build(:node, :condition, data: {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('has invalid kind: ')
    end

    describe 'V2 condition data' do
      it 'rejects V2 condition data with unexpected keys' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'census',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'value',
          comparator: 'greater_than',
          target: 'exact_number',
          targetTotal: 0,
          script: 'alert(1)'
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('contains invalid keys: script')
      end

      it 'rejects invalid subjectFilterMode for census V2 conditions' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'census',
          subject: 'moved_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'banana',
          operator: 'value',
          comparator: 'greater_than',
          target: 'exact_number',
          targetTotal: 0
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('has invalid subjectFilterMode')
      end

      it 'rejects captured-piece census targets for mobility' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'census',
          subject: 'allied',
          subjectFilter: 'any',
          operator: 'mobility',
          comparator: 'greater_than',
          target: 'captured_piece',
          targetFilter: 'any'
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('has invalid target')
      end

      it 'rejects invalid targetFilterMode for relational V2 conditions' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'queen',
          targetFilterMode: 'banana'
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('has invalid targetFilterMode')
      end

      it 'delegates data normalization before validation' do
        input_data = {
          version: 2,
          kind: 'census',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'value',
          comparator: 'greater_than',
          target: 'exact_number',
          targetTotal: 0
        }
        normalized_data = input_data.transform_keys(&:to_s)

        expect(Nodes::DataNormalizer).to receive(:normalize).with(
          node_type: 'condition',
          data: include('kind' => 'census', 'subject' => 'moved_piece')
        ).and_return(normalized_data)

        node = build(:node, :condition, data: input_data)

        expect(node).to be_valid
        expect(node.data).to eq(normalized_data)
      end

      it 'rejects a target-side comparison when subjectComparisonSource is prior_board_state' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          subjectComparisonMetric: 'count',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'prior_board_state',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any',
          targetComparisonMetric: 'count',
          targetComparator: 'greater_than',
          targetComparisonSource: 'exact_number',
          targetComparisonSourceTotal: 0
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('cannot use target-side comparison when subjectComparisonSource is prior_board_state')
      end

      it 'rejects a subject-side comparison when targetComparisonSource is prior_board_state' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          subjectComparisonMetric: 'count',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'exact_number',
          subjectComparisonSourceTotal: 0,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any',
          targetComparisonMetric: 'count',
          targetComparator: 'greater_than',
          targetComparisonSource: 'prior_board_state'
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('cannot use subject-side comparison when targetComparisonSource is prior_board_state')
      end

      it 'accepts a relational individual_value comparison metric' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          subjectComparisonMetric: 'individual_value',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'exact_number',
          subjectComparisonSourceTotal: 0,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any'
        })

        expect(node).to be_valid
      end

      it 'rejects aggregate_value as a subject relational comparison metric' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          subjectComparisonMetric: 'aggregate_value',
          subjectComparator: 'greater_than',
          subjectComparisonSource: 'exact_number',
          subjectComparisonSourceTotal: 0,
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any'
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('has invalid subjectComparisonMetric')
      end

      it 'rejects aggregate_value as a target relational comparison metric' do
        node = build(:node, :condition, data: {
          version: 2,
          kind: 'relational',
          subject: 'allied',
          subjectFilter: 'any',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'any',
          targetComparisonMetric: 'aggregate_value',
          targetComparator: 'greater_than',
          targetComparisonSource: 'exact_number',
          targetComparisonSourceTotal: 0
        })

        expect(node).not_to be_valid
        expect(node.errors[:data]).to include('has invalid targetComparisonMetric')
      end
    end

    it 'is valid with prototype action data' do
      node = build(:node, :score)
      expect(node).to be_valid
    end

    it 'rejects action data with invalid keys' do
      node = build(:node, :score, data: { actionType: 'add', value: 1, bonus: 4 })

      expect(node).not_to be_valid
      expect(node.errors[:data]).to include('contains invalid keys: bonus')
    end

    it 'rejects action data with invalid actionType' do
      node = build(:node, :score, data: { actionType: 'move', value: 1 })

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

    it 'can be an score node' do
      node = build(:node, :score)
      expect(node.node_type).to eq('score')
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

      it 'returns false for score nodes' do
        node = build(:node, :score)
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
