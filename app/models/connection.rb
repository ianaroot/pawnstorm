# == Schema Information
#
# Table name: connections
#
#  id            :bigint           not null, primary key
#  source_node_id :bigint          not null
#  target_node_id :bigint          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
class Connection < ApplicationRecord
  belongs_to :source_node, class_name: 'Node'
  belongs_to :target_node, class_name: 'Node'

  validates :source_node_id, presence: true
  validates :target_node_id, presence: true
  validates :source_node_id, uniqueness: { scope: :target_node_id, message: "connection already exists" }

  validate :source_and_target_must_be_different
  validate :source_and_target_must_belong_to_same_bot
  validate :bidirectional_connection_must_not_exist

  after_commit :mark_bot_compiled_program_stale, on: [:create, :destroy]

  private

  def mark_bot_compiled_program_stale
    bot_id = source_node&.bot_id || target_node&.bot_id
    Bot.where(id: bot_id).find_each(&:mark_compiled_program_stale!)
  end

  def source_and_target_must_be_different
    return unless source_node_id.present? && target_node_id.present?
    return unless source_node_id == target_node_id
    errors.add(:target_node_id, "cannot connect a node to itself")
  end

  def source_and_target_must_belong_to_same_bot
    return unless source_node && target_node
    return if source_node.bot_id == target_node.bot_id

    errors.add(:target_node_id, "must belong to the same bot as source node")
  end

  def bidirectional_connection_must_not_exist
    return unless source_node_id.present? && target_node_id.present?
    return if source_node_id == target_node_id

    reverse_connection = Connection.find_by(
      source_node_id: target_node_id,
      target_node_id: source_node_id
    )
    return unless reverse_connection
    errors.add(:base, "cannot create bidirectional connection (reverse connection already exists)")
  end
end
