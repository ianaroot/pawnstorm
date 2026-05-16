class RenameRelationalAggregateValueToIndividualValue < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{subjectComparisonMetric}', '"individual_value"')::json
      WHERE data->>'subjectComparisonMetric' = 'aggregate_value'
        AND data->>'kind' = 'relational';

      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{targetComparisonMetric}', '"individual_value"')::json
      WHERE data->>'targetComparisonMetric' = 'aggregate_value'
        AND data->>'kind' = 'relational';
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
          'aggregate_value -> individual_value is lossy (individual != aggregate). ' \
          'Restore from the pre-migration DB snapshot / branch state instead.'
  end
end
