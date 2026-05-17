class MigrateConditionKindsToCensusAndIdentity < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      UPDATE nodes
      SET data = jsonb_set(
        CASE WHEN jsonb_exists(data::jsonb, 'target')
             THEN data::jsonb
             ELSE jsonb_set(data::jsonb, '{target}', '"exact_number"') END,
        '{kind}', '"census"'
      )::json
      WHERE node_type = 'condition'
        AND data->>'kind' IN ('unary', 'position');

      UPDATE nodes
      SET data = jsonb_build_object(
        'version', data::jsonb->'version',
        'kind', '"identity"'::jsonb,
        'subject', data::jsonb->'subject',
        'target', data::jsonb->'target'
      )::json
      WHERE node_type = 'condition'
        AND data->>'kind' = 'relational'
        AND data->>'operator' = 'same_piece';
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
          'kind unification is lossy (census loses its unary/position origin; ' \
          'identity drops the relational payload). Restore from the ' \
          'pre-migration DB snapshot / branch state instead.'
  end
end
