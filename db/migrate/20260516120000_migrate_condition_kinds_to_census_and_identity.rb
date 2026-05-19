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

      -- Raw SQL bypasses the Node/Connection after_commit hooks that mark a
      -- bot's compiled_program stale. Without this every bot whose nodes we
      -- just rewrote keeps serving its pre-migration compiled program -- one
      -- that still carries the retired 'unary'/'position' kinds the V2
      -- evaluator now rejects, crashing every match. Invalidate the cache so
      -- the existing recompile-before-match path regenerates it.
      UPDATE bots
      SET compiled_program_stale = true
      WHERE compiled_program_stale = false;
    SQL
  end

  def down
    raise ActiveRecord::IrreversibleMigration,
          'kind unification is lossy (census loses its unary/position origin; ' \
          'identity drops the relational payload). Restore from the ' \
          'pre-migration DB snapshot / branch state instead.'
  end
end
