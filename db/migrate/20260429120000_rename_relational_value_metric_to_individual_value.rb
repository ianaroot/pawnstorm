class RenameRelationalValueMetricToIndividualValue < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(data, '{subjectComparisonMetric}', '"individual_value"')
      WHERE data->>'subjectComparisonMetric' = 'value'
        AND data->>'kind' = 'relational';

      UPDATE nodes
      SET data = jsonb_set(data, '{targetComparisonMetric}', '"individual_value"')
      WHERE data->>'targetComparisonMetric' = 'value'
        AND data->>'kind' = 'relational';
    SQL
  end

  def down
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(data, '{subjectComparisonMetric}', '"value"')
      WHERE data->>'subjectComparisonMetric' = 'individual_value'
        AND data->>'kind' = 'relational';

      UPDATE nodes
      SET data = jsonb_set(data, '{targetComparisonMetric}', '"value"')
      WHERE data->>'targetComparisonMetric' = 'individual_value'
        AND data->>'kind' = 'relational';
    SQL
  end
end
