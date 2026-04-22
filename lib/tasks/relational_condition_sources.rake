namespace :conditions do
  desc 'Migrate V2 relational comparison values to comparison sources'
  task migrate_relational_comparison_sources: :environment do
    migrated = 0

    Node.where(node_type: 'condition').find_each do |node|
      data = node.data.deep_dup
      next unless data.is_a?(Hash)
      next unless data['version'] == 2 && data['kind'] == 'relational'

      changed = false
      if data.key?('mode')
        data.delete('mode')
        changed = true
      end

      %w[subject target].each do |side|
        value_key = "#{side}ComparisonValue"
        source_key = "#{side}ComparisonSource"
        total_key = "#{side}ComparisonSourceTotal"
        next unless data.key?(value_key)

        comparison_value = data.delete(value_key)
        if comparison_value.is_a?(Numeric)
          data[source_key] = 'exact_number'
          data[total_key] = comparison_value
        else
          data[source_key] = comparison_value.to_s.delete_suffix('_value')
          data.delete(total_key)
        end
        changed = true
      end

      next unless changed

      node.update!(data:)
      migrated += 1
    end

    puts "Migrated #{migrated} relational condition node#{'s' unless migrated == 1}."
  end
end
