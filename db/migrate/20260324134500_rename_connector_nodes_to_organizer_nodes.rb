class RenameConnectorNodesToOrganizerNodes < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      UPDATE nodes
      SET node_type = 'organizer'
      WHERE node_type = 'connector'
    SQL

    remove_check_constraint :nodes, name: 'node_type_check'
    add_check_constraint :nodes,
      "node_type IN ('condition', 'action', 'root', 'organizer')",
      name: 'node_type_check'
  end

  def down
    execute <<~SQL
      UPDATE nodes
      SET node_type = 'connector'
      WHERE node_type = 'organizer'
    SQL

    remove_check_constraint :nodes, name: 'node_type_check'
    add_check_constraint :nodes,
      "node_type IN ('condition', 'action', 'root', 'connector')",
      name: 'node_type_check'
  end
end
