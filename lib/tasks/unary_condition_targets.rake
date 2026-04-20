namespace :conditions do
  desc 'Migrate V2 unary condition comparisonValue fields to target-based unary comparisons'
  task migrate_unary_comparison_targets: :environment do
    migrated = 0
    skipped = 0

    Node.where(node_type: 'condition')
      .where("data ->> 'version' = ?", '2')
      .where("data ->> 'kind' = ?", 'unary')
      .find_each do |node|
        data = node.data.deep_dup

        unless data.key?('comparisonValue')
          skipped += 1
          next
        end

        comparison_value = data.delete('comparisonValue')
        case comparison_value
        when Numeric
          data['target'] = 'exact_number'
          data['targetTotal'] = comparison_value
        when 'prior_board_state'
          data['target'] = 'prior_board_state'
        when 'moved_piece_value'
          data['target'] = 'moved_piece'
          data['targetFilter'] = 'any'
        when 'captured_piece_value'
          data['target'] = 'captured_piece'
          data['targetFilter'] = 'any'
        when 'enemy_moved_piece_value'
          data['target'] = 'enemy_moved_piece'
          data['targetFilter'] = 'any'
        when 'enemy_captured_piece_value'
          data['target'] = 'enemy_captured_piece'
          data['targetFilter'] = 'any'
        else
          if comparison_value.to_s.match?(/\A-?\d+(\.\d+)?\z/)
            data['target'] = 'exact_number'
            data['targetTotal'] = comparison_value.to_s.include?('.') ? comparison_value.to_f : comparison_value.to_i
          else
            raise "Unknown unary comparisonValue #{comparison_value.inspect} on node #{node.id}"
          end
        end

        node.update!(data:)
        migrated += 1
      end

    puts "Migrated #{migrated} unary condition nodes; skipped #{skipped} already-migrated nodes."
  end
end
