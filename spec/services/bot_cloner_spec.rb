# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BotCloner do
  let(:user) { create(:user) }
  let(:source_bot) { create(:bot, user: user, name: 'My Bot', description: 'desc') }
  let(:root) { source_bot.root_node }

  def cloner
    described_class.new(source_bot, user)
  end

  describe '#clone!' do
    context 'bot attributes' do
      it 'creates a new bot for the same user' do
        clone = cloner.clone!
        expect(clone.user).to eq(user)
      end

      it 'copies the description' do
        clone = cloner.clone!
        expect(clone.description).to eq('desc')
      end

      it 'does not share an id with the source' do
        clone = cloner.clone!
        expect(clone.id).not_to eq(source_bot.id)
      end
    end

    context 'clone naming' do
      it 'names the first clone "Clone My Bot"' do
        clone = cloner.clone!
        expect(clone.name).to eq('Clone My Bot')
      end

      it 'names the second clone "Clone My Bot(2)"' do
        create(:bot, user: user, name: 'Clone My Bot')
        clone = cloner.clone!
        expect(clone.name).to eq('Clone My Bot(2)')
      end

      it 'increments past existing numbered clones' do
        create(:bot, user: user, name: 'Clone My Bot')
        create(:bot, user: user, name: 'Clone My Bot(2)')
        clone = cloner.clone!
        expect(clone.name).to eq('Clone My Bot(3)')
      end

      it 'considers clones owned by other users when numbering (names are globally unique)' do
        create(:bot, user: create(:user), name: 'Clone My Bot')
        clone = cloner.clone!
        expect(clone.name).to eq('Clone My Bot(2)')
      end
    end

    context 'node copying' do
      let!(:condition) { create(:node, :condition, bot: source_bot) }
      let!(:action) { create(:node, :action, bot: source_bot) }

      it 'does not duplicate the root node' do
        clone = cloner.clone!
        expect(clone.nodes.where(node_type: 'root').count).to eq(1)
      end

      it 'copies non-root nodes' do
        clone = cloner.clone!
        expect(clone.nodes.where(node_type: 'condition').count).to eq(1)
        expect(clone.nodes.where(node_type: 'action').count).to eq(1)
      end

      it 'assigns all nodes to the clone, not the source' do
        clone = cloner.clone!
        expect(clone.nodes.pluck(:id)).not_to include(*source_bot.nodes.pluck(:id))
      end

      it 'preserves node data' do
        clone = cloner.clone!
        cloned_condition = clone.nodes.find_by(node_type: 'condition')
        expect(cloned_condition.data).to eq(condition.data)
      end

      it 'preserves node positions' do
        clone = cloner.clone!
        cloned_condition = clone.nodes.find_by(node_type: 'condition')
        expect(cloned_condition.position_x).to eq(condition.position_x)
        expect(cloned_condition.position_y).to eq(condition.position_y)
      end

      it 'deep-copies node data so mutations do not propagate' do
        clone = cloner.clone!
        cloned_condition = clone.nodes.find_by(node_type: 'condition')
        cloned_condition.data['targetTotal'] = 999
        cloned_condition.save!
        expect(condition.reload.data['targetTotal']).not_to eq(999)
      end
    end

    context 'connection copying' do
      let!(:condition) { create(:node, :condition, bot: source_bot) }
      let!(:action) { create(:node, :action, bot: source_bot) }

      before do
        Connection.create!(source_node_id: root.id, target_node_id: condition.id)
        Connection.create!(source_node_id: condition.id, target_node_id: action.id)
      end

      it 'copies all connections' do
        clone = cloner.clone!
        expect(clone.nodes.flat_map(&:outgoing_connections).count).to eq(2)
      end

      it 'remaps connections to cloned node ids' do
        clone = cloner.clone!
        clone_node_ids = clone.nodes.pluck(:id)
        clone.nodes.flat_map(&:outgoing_connections).each do |conn|
          expect(clone_node_ids).to include(conn.source_node_id)
          expect(clone_node_ids).to include(conn.target_node_id)
        end
      end

      it 'connects the cloned root to the cloned condition' do
        clone = cloner.clone!
        clone_root = clone.root_node
        clone_condition = clone.nodes.find_by(node_type: 'condition')
        expect(clone_root.outgoing_connections.map(&:target_node_id)).to include(clone_condition.id)
      end
    end

    context 'compilation' do
      it 'marks the clone as not stale' do
        clone = cloner.clone!
        expect(clone.compiled_program_stale).to be(false)
      end

      it 'sets a compiled program on the clone' do
        clone = cloner.clone!
        expect(clone.compiled_program).to be_present
      end

      context 'when compilation fails' do
        before do
          allow_any_instance_of(Bot).to receive(:compile_program!).and_raise(StandardError, 'bad graph')
        end

        it 'raises so the controller can handle it' do
          expect { cloner.clone! }.to raise_error(StandardError, 'bad graph')
        end
      end
    end

    context 'atomicity' do
      it 'does not persist a partial clone if connection creation fails' do
        condition = create(:node, :condition, bot: source_bot)
        Connection.create!(source_node_id: root.id, target_node_id: condition.id)
        allow(Connection).to receive(:create!).and_raise(ActiveRecord::RecordInvalid)

        expect { cloner.clone! }.to raise_error(ActiveRecord::RecordInvalid)
        expect(Bot.where(user: user).count).to eq(1)
      end
    end
  end
end
