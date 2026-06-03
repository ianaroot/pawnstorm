# == Schema Information
#
# Table name: nodes
#
#  id          :bigint           not null, primary key
#  bot_id      :bigint           not null
#  node_type   :string           not null
#  data        :json             default: {}
#  position_x  :float            default: 0
#  position_y  :float            default: 0
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
class Node < ApplicationRecord
  NODE_TYPES = %w[condition score root organizer].freeze

  belongs_to :bot
  has_many :outgoing_connections, class_name: 'Connection', foreign_key: 'source_node_id', dependent: :destroy
  has_many :incoming_connections, class_name: 'Connection', foreign_key: 'target_node_id', dependent: :destroy

  validates :node_type, presence: true
  validates :node_type, inclusion: { in: NODE_TYPES }
  before_validation :normalize_node_data

  # Ensure only one root per bot (DB has unique index, this validates before save)
  validate :single_root_per_bot, if: -> { node_type == 'root' }
  validate :data_matches_schema, if: :validate_node_data?

  after_commit :mark_bot_compiled_program_stale_if_needed, on: [:create, :update, :destroy]

  # Node type helpers
  def root?
    node_type == 'root'
  end
  
  def score?
    node_type == 'score'
  end

  def condition?
    node_type == 'condition'
  end
  
  def organizer?
    node_type == 'organizer'
  end

  private
  def normalize_node_data
    self.data = Nodes::DataNormalizer.normalize(node_type: node_type, data: data)
  end

  def validate_node_data?
    new_record? || will_save_change_to_data?
  end

  def data_matches_schema
    Nodes::DataValidator.validate(self)
  end

  def mark_bot_compiled_program_stale_if_needed
    return if previously_persisted? && destroyed? == false && !saved_change_to_position_x? && !saved_change_to_position_y? && !saved_change_to_data?

    Bot.mark_stale_for(bot_id)
  end
  
  def single_root_per_bot
    existing_root = bot.nodes.where(node_type: 'root').where.not(id: id).exists?
    if existing_root
      errors.add(:node_type, "bot already has a root node")
    end
  end
end
