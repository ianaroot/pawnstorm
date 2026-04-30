class RenameRelationalValueMetricToIndividualValue < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{subjectComparisonMetric}', '"individual_value"')::json
      WHERE data->>'subjectComparisonMetric' = 'value'
        AND data->>'kind' = 'relational';

      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{targetComparisonMetric}', '"individual_value"')::json
      WHERE data->>'targetComparisonMetric' = 'value'
        AND data->>'kind' = 'relational';
    SQL
  end

  def down
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{subjectComparisonMetric}', '"value"')::json
      WHERE data->>'subjectComparisonMetric' = 'individual_value'
        AND data->>'kind' = 'relational';

      UPDATE nodes
      SET data = jsonb_set(data::jsonb, '{targetComparisonMetric}', '"value"')::json
      WHERE data->>'targetComparisonMetric' = 'individual_value'
        AND data->>'kind' = 'relational';
    SQL
  end
end
