# frozen_string_literal: true

namespace :conditions do
  desc 'Convert group census value conditions from "any" to non-king (filter: king, ' \
       'mode: exclude). Targets allied/enemy value+any census conditions only — their ' \
       '"any" set includes the king, whose Infinity value poisons the aggregate. ' \
       'Singular-actor conditions (moved_piece/captured_piece/enemy_moved_piece/' \
       'enemy_captured_piece) are intentionally left untouched: they are either ' \
       'never-king or correctly king-valued under king=Infinity. Idempotent. ' \
       'Set DRY_RUN=1 to preview without writing.'
  task census_value_any_to_non_king: :environment do
    dry_run = ENV['DRY_RUN'].present?
    group_subjects = %w[allied enemy]

    candidates = Node.where(node_type: 'condition')
                     .where("data->>'kind' = 'census'")
                     .where("data->>'operator' = 'value'")
                     .where("data->>'subjectFilter' = 'any'")
                     .where("data->>'subject' IN (?)", group_subjects)

    puts "Found #{candidates.size} group census value+any condition(s)#{dry_run ? ' (dry run)' : ''}."

    converted = 0
    candidates.find_each do |node|
      puts "  node #{node.id} (bot #{node.bot_id}): #{node.data['subject']} value any -> non-king"
      next if dry_run

      node.data = node.data.merge('subjectFilter' => 'king', 'subjectFilterMode' => 'exclude')
      node.save!
      converted += 1
    end

    puts dry_run ? 'Dry run — no changes written.' : "Converted #{converted} condition(s)."
  end
end
