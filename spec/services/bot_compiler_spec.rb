# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BotCompiler do
  let(:user) { create(:user) }
  let(:bot) { create(:bot, user: user) }

  describe '#compile' do
    context 'simple chain' do
      let!(:root) { bot.root_node }
      let!(:condition) do
        create(:node, :condition, bot: bot, position_x: 100, position_y: 100, data: {
          version: 2,
          kind: 'unary',
          subject: 'moved_piece',
          subjectFilter: 'any',
          subjectFilterMode: 'include',
          operator: 'value',
          comparator: 'greater_than',
          target: 'exact_number',
          targetTotal: 0
        })
      end
      let!(:action) do
        create(:node, :action, bot: bot, position_x: 100, position_y: 220, data: {
          actionType: 'subtract',
          value: 5
        })
      end

      before do
        connect_nodes(root, condition)
        connect_nodes(condition, action)
      end

      it 'emits a versioned compiled program rooted at the bot root' do
        compiled = described_class.new(bot).compile

        expect(compiled[:version]).to eq(1)
        expect(compiled[:root]).to eq(root.id.to_s)
        expect(compiled[:nodes].keys).to include(root.id.to_s, condition.id.to_s, action.id.to_s)
      end

      it 'preserves node type, normalized data, and ordered children' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][condition.id.to_s]).to eq(
          {
            id: condition.id.to_s,
            type: 'condition',
            data: {
              version: 2,
              kind: 'unary',
              subject: 'moved_piece',
              subjectFilter: 'any',
              operator: 'value',
              comparator: 'greater_than',
              target: 'exact_number',
              targetTotal: 0
            },
            children: [action.id.to_s]
          }
        )
      end
    end

    context 'v2 condition nodes' do
      let!(:root) { bot.root_node }
      let!(:relational_condition) do
        create(:node, :condition, bot: bot, position_x: 100, position_y: 100, data: {
          version: 2,
          kind: 'relational',
          subject: 'moved_piece',
          subjectFilter: 'any',
          operator: 'attack',
          target: 'enemy',
          targetFilter: 'queen',
          targetFilterMode: 'include',
          targetComparisonMetric: 'count',
          targetComparator: 'greater_than',
          targetComparisonSource: 'exact_number',
          targetComparisonSourceTotal: 0
        })
      end
      let!(:unary_condition) do
        create(:node, :condition, bot: bot, position_x: 220, position_y: 100, data: {
          version: 2,
          kind: 'unary',
          subject: 'enemy_moved_piece',
          subjectFilter: 'pawn',
          subjectFilterMode: 'include',
          operator: 'value',
          comparator: 'equal_to',
          target: 'captured_piece',
          targetFilter: 'any'
        })
      end

      before do
        connect_nodes(root, relational_condition)
        connect_nodes(root, unary_condition)
      end

      it 'preserves v2 relational condition payloads in compiled output' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][relational_condition.id.to_s][:data]).to eq(
          {
            version: 2,
            kind: 'relational',
            subject: 'moved_piece',
            subjectFilter: 'any',
            operator: 'attack',
            target: 'enemy',
            targetFilter: 'queen',
            targetFilterMode: 'include',
            targetComparisonMetric: 'count',
            targetComparator: 'greater_than',
            targetComparisonSource: 'exact_number',
            targetComparisonSourceTotal: 0
          }
        )
      end

      it 'preserves v2 unary condition payloads in compiled output' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][unary_condition.id.to_s][:data]).to eq(
          {
            version: 2,
            kind: 'unary',
            subject: 'enemy_moved_piece',
            subjectFilter: 'pawn',
            subjectFilterMode: 'include',
            operator: 'value',
            comparator: 'equal_to',
            target: 'captured_piece',
            targetFilter: 'any'
          }
        )
      end
    end

    context 'disconnected nodes' do
      let!(:root) { bot.root_node }
      let!(:connected) { create(:node, :condition, bot: bot, position_x: 100, position_y: 100) }
      let!(:disconnected) { create(:node, :condition, bot: bot, position_x: 500, position_y: 500) }

      before do
        connect_nodes(root, connected)
      end

      it 'only compiles nodes reachable from root' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes].keys).to include(root.id.to_s, connected.id.to_s)
        expect(compiled[:nodes].keys).not_to include(disconnected.id.to_s)
      end
    end

    context 'ordered siblings' do
      let!(:root) { bot.root_node }
      let!(:left) { create(:node, :condition, bot: bot, position_x: 50, position_y: 200) }
      let!(:right) { create(:node, :condition, bot: bot, position_x: 150, position_y: 200) }

      before do
        root.update!(position_x: 100, position_y: 50)
        connect_nodes(root, left)
        connect_nodes(root, right)
      end

      it 'preserves NodeSortOrder child ordering in the compiled output' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][root.id.to_s][:children]).to eq([left.id.to_s, right.id.to_s])
      end
    end

    context 'collinear siblings' do
      let!(:root) { bot.root_node }
      let!(:near) { create(:node, :condition, bot: bot, position_x: 100, position_y: 200) }
      let!(:mid) { create(:node, :condition, bot: bot, position_x: 100, position_y: 350) }
      let!(:far) { create(:node, :condition, bot: bot, position_x: 100, position_y: 600) }

      before do
        root.update!(position_x: 100, position_y: 50)
        connect_nodes(root, far)
        connect_nodes(root, mid)
        connect_nodes(root, near)
      end

      it 'orders collinear children by distance in the compiled output' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][root.id.to_s][:children]).to eq([near.id.to_s, mid.id.to_s, far.id.to_s])
      end
    end

    context 'shared descendants in a DAG' do
      let!(:root) { bot.root_node }
      let!(:node_a) { create(:node, :condition, bot: bot, position_x: 200, position_y: 200) }
      let!(:node_b) { create(:node, :condition, bot: bot, position_x: 600, position_y: 200) }
      let!(:shared) { create(:node, :action, bot: bot, position_x: 400, position_y: 400, data: { actionType: 'add', value: 3 }) }

      before do
        connect_nodes(root, node_a)
        connect_nodes(root, node_b)
        connect_nodes(node_a, shared)
        connect_nodes(node_b, shared)
      end

      it 'stores the shared node once and references it from both parents' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes].keys.count(shared.id.to_s)).to eq(1)
        expect(compiled[:nodes][node_a.id.to_s][:children]).to include(shared.id.to_s)
        expect(compiled[:nodes][node_b.id.to_s][:children]).to include(shared.id.to_s)
      end
    end

    context 'organizer nodes' do
      let!(:root) { bot.root_node }
      let!(:organizer) do
        create(:node, :organizer, bot: bot, position_x: 100, position_y: 100, data: {
          title: 'Fork ideas',
          notes: 'if this ever compiles into runtime logic, something has gone wrong'
        })
      end
      let!(:condition) { create(:node, :condition, bot: bot, position_x: 100, position_y: 220) }

      before do
        connect_nodes(root, organizer)
        connect_nodes(organizer, condition)
      end

      it 'preserves organizers in the compiled graph as pass-through structure' do
        compiled = described_class.new(bot).compile

        expect(compiled[:nodes][organizer.id.to_s][:type]).to eq('organizer')
        expect(compiled[:nodes][organizer.id.to_s][:data]).to eq({ title: 'Fork ideas' })
        expect(compiled[:nodes][organizer.id.to_s][:children]).to eq([condition.id.to_s])
      end
    end

    context 'cycles' do
      let!(:root) { bot.root_node }
      let!(:node_a) { create(:node, :condition, bot: bot, position_x: 100, position_y: 100) }
      let!(:node_b) { create(:node, :condition, bot: bot, position_x: 200, position_y: 100) }
      let!(:node_c) { create(:node, :condition, bot: bot, position_x: 300, position_y: 100) }

      before do
        connect_nodes(root, node_a)
        connect_nodes(node_a, node_b)
        connect_nodes(node_b, node_c)
        connect_nodes(node_c, node_a)
      end

      it 'raises InfiniteLoopError when compilation encounters a cycle' do
        expect { described_class.new(bot).compile }.to raise_error(BotCompiler::InfiniteLoopError)
      end
    end
  end
end
