require 'rails_helper'

RSpec.describe NodeConnection, type: :model do
  describe 'validations' do
    it 'is valid with source_node and target_node' do
      source_node = create(:node)
      target_node = create(:node, bot: source_node.bot)
      connection = described_class.new(source_node: source_node, target_node: target_node)
      expect(connection).to be_valid
    end

    it 'is invalid without a source_node' do
      target_node = create(:node)
      connection = described_class.new(source_node: nil, target_node: target_node)
      expect(connection).not_to be_valid
      expect(connection.errors[:source_node]).to include("must exist")
    end

    it 'is invalid without a target_node' do
      source_node = create(:node)
      connection = described_class.new(source_node: source_node, target_node: nil)
      expect(connection).not_to be_valid
      expect(connection.errors[:target_node]).to include("must exist")
    end

    it 'is invalid with duplicate source_node_id and target_node_id' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      described_class.create!(source_node: node1, target_node: node2)
      
      duplicate = described_class.new(source_node: node1, target_node: node2)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:source_node_id]).to include("connection already exists")
    end

    it 'is invalid when source and target are the same node' do
      node = create(:node)
      connection = described_class.new(source_node: node, target_node: node)
      
      expect(connection).not_to be_valid
      expect(connection.errors[:target_node_id]).to include("cannot connect a node to itself")
    end

    it 'is invalid when reverse connection already exists' do
      node_a = create(:node)
      node_b = create(:node, bot: node_a.bot)
      described_class.create!(source_node: node_a, target_node: node_b)
      
      # Try to create B -> A when A -> B already exists
      bidirectional = described_class.new(source_node: node_b, target_node: node_a)
      
      expect(bidirectional).not_to be_valid
      expect(bidirectional.errors[:base]).to include("cannot create bidirectional connection (reverse connection already exists)")
    end

    it 'allows multiple connections from the same source to different targets' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      node3 = create(:node, bot: node1.bot)
      
      described_class.create!(source_node: node1, target_node: node2)
      connection2 = described_class.new(source_node: node1, target_node: node3)
      
      expect(connection2).to be_valid
    end

    it 'allows multiple connections from different sources to the same target' do
      node1 = create(:node)
      node2 = create(:node, bot: node1.bot)
      node3 = create(:node, bot: node1.bot)
      
      described_class.create!(source_node: node1, target_node: node3)
      connection2 = described_class.new(source_node: node2, target_node: node3)
      
      expect(connection2).to be_valid
    end
  end

  describe 'associations' do
    it 'belongs to a source_node' do
      node = create(:node)
      other_node = create(:node, bot: node.bot)
      connection = described_class.create!(source_node: node, target_node: other_node)
      expect(connection.source_node).to eq(node)
    end

    it 'belongs to a target_node' do
      node = create(:node)
      other_node = create(:node, bot: node.bot)
      connection = described_class.create!(source_node: other_node, target_node: node)
      expect(connection.target_node).to eq(node)
    end
  end
end
