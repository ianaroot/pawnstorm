module GraphHelpers
  def connect_nodes(source_node, target_node)
    unless source_node.bot == target_node.bot
      raise ArgumentError, 'nodes must belong to the same bot'
    end

    Connection.create!(source_node: source_node, target_node: target_node)
  end
end
