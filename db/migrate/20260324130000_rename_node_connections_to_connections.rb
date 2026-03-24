class RenameNodeConnectionsToConnections < ActiveRecord::Migration[7.1]
  def change
    rename_table :node_connections, :connections
  end
end
