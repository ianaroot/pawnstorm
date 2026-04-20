class BotCloner
  def initialize(source_bot, user)
    @source_bot = source_bot
    @user = user
  end

  def clone!
    clone = nil

    ActiveRecord::Base.transaction do
      clone = @user.bots.create!(
        name: next_clone_name,
        description: @source_bot.description,
        commands: @source_bot.commands
      )

      id_map = {}
      source_root = @source_bot.nodes.find_by(node_type: 'root')
      clone_root = clone.nodes.find_by(node_type: 'root')
      id_map[source_root.id] = clone_root.id if source_root && clone_root

      @source_bot.nodes.where.not(node_type: 'root').each do |node|
        new_node = clone.nodes.create!(
          node_type: node.node_type,
          position_x: node.position_x,
          position_y: node.position_y,
          data: node.data.deep_dup
        )
        id_map[node.id] = new_node.id
      end

      @source_bot.nodes.each do |node|
        node.outgoing_connections.each do |conn|
          Connection.create!(
            source_node_id: id_map[conn.source_node_id],
            target_node_id: id_map[conn.target_node_id]
          )
        end
      end
    end

    clone.compile_program!
    clone
  end

  private

  def next_clone_name
    base = "Clone #{@source_bot.name}"
    existing = Bot.where("name = ? OR name LIKE ?", base, "#{base}(%)")
                  .pluck(:name)
    return base unless existing.include?(base)

    n = 2
    n += 1 while existing.include?("#{base}(#{n})")
    "#{base}(#{n})"
  end
end
