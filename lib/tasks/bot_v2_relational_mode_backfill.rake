# frozen_string_literal: true

namespace :bots do
  desc 'Backfill V2 relational attack/defend nodes with ignore_king_safety mode. Usage: rake "bots:backfill_v2_relational_mode"'
  task backfill_v2_relational_mode: :environment do
    updated_nodes = 0
    affected_bot_ids = []

    Node.where(node_type: 'condition').find_each do |node|
      data = node.data
      next unless data.is_a?(Hash)
      next unless (data['version'] || data[:version]).to_i == 2
      next unless data['kind'].to_s == 'relational'
      next unless %w[attack defend].include?(data['operator'].to_s)
      next if data['mode'].present?

      node.update!(
        data: data.merge('mode' => 'ignore_king_safety')
      )
      updated_nodes += 1
      affected_bot_ids << node.bot_id
    end

    affected_bot_ids.uniq.each do |bot_id|
      Bot.find(bot_id).compile_program!
    end

    puts "Updated nodes: #{updated_nodes}"
    puts "Bots recompiled: #{affected_bot_ids.uniq.length}"
  end
end
