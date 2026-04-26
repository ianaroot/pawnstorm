class RenameActionNodesToScoreNodes < ActiveRecord::Migration[7.1]
  NODE_TYPE_CHECK_NAME = "node_type_check"
  LEGACY_NODE_TYPE = "action"
  NEW_NODE_TYPE = "score"

  class MigrationBot < ApplicationRecord
    self.table_name = "bots"
  end

  class MigrationMatch < ApplicationRecord
    self.table_name = "matches"
  end

  class MigrationTournamentEntry < ApplicationRecord
    self.table_name = "tournament_entries"
  end

  def up
    rename_node_type!(from: LEGACY_NODE_TYPE, to: NEW_NODE_TYPE)
  end

  def down
    rename_node_type!(from: NEW_NODE_TYPE, to: LEGACY_NODE_TYPE)
  end

  private

  def rename_node_type!(from:, to:)
    replace_node_type_check_constraint!(allowed_node_types: [from, to])
    update_node_rows!(from:, to:)
    update_compiled_program_snapshots!(from:, to:)
    replace_node_type_check_constraint!(allowed_node_types: [to])
  end

  def update_node_rows!(from:, to:)
    execute <<~SQL.squish
      UPDATE nodes
      SET node_type = #{quote(to)}
      WHERE node_type = #{quote(from)}
    SQL
  end

  def update_compiled_program_snapshots!(from:, to:)
    rewrite_json_column_sql!(:bots, :compiled_program, from:, to:)
    rewrite_json_column_sql!(:matches, :white_compiled_program_snapshot, from:, to:)
    rewrite_json_column_sql!(:matches, :black_compiled_program_snapshot, from:, to:)
    rewrite_json_column_sql!(:tournament_entries, :compiled_program_snapshot, from:, to:)
  end

  def rewrite_json_column_sql!(table_name, column, from:, to:)
    from_type_pattern = %("type"\\s*:\\s*"#{Regexp.escape(from)}")
    to_type_json = %("type":"#{to}")
    from_node_type_pattern = %("nodeType"\\s*:\\s*"#{Regexp.escape(from)}")
    to_node_type_json = %("nodeType":"#{to}")

    execute <<~SQL.squish
      UPDATE #{quote_table_name(table_name)}
      SET #{quote_column_name(column)} = regexp_replace(
        regexp_replace(
          #{quote_column_name(column)}::text,
          #{quote(from_type_pattern)},
          #{quote(to_type_json)},
          'g'
        ),
        #{quote(from_node_type_pattern)},
        #{quote(to_node_type_json)},
        'g'
      )::json
      WHERE #{quote_column_name(column)} IS NOT NULL
        AND #{quote_column_name(column)}::text LIKE #{quote("%#{from}%")}
    SQL
  end

  def replace_node_type_check_constraint!(allowed_node_types:)
    allowed_types = ["condition", *allowed_node_types, "root", "organizer"].uniq
    constraint_sql = "node_type IN (#{allowed_types.map { |type| quote(type) }.join(', ')})"

    remove_check_constraint :nodes, name: NODE_TYPE_CHECK_NAME
    add_check_constraint :nodes,
      constraint_sql,
      name: NODE_TYPE_CHECK_NAME
  end
end
