# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

seed_email = ENV.fetch('SEED_USER_EMAIL', 'seed@example.com')
seed_password = ENV.fetch('SEED_USER_PASSWORD', 'password123')

user = User.find_or_initialize_by(email: seed_email)
if user.new_record?
  user.password = seed_password
  user.password_confirmation = seed_password
end
user.save!

def reset_bot_graph!(bot)
  bot.nodes.where.not(node_type: 'root').destroy_all
  root = bot.root_node
  root.update!(position_x: 600, position_y: 50) if root
end

def create_condition!(bot:, position_x:, position_y:, data:)
  bot.nodes.create!(
    node_type: 'condition',
    position_x: position_x,
    position_y: position_y,
    data: data
  )
end

def create_action!(bot:, position_x:, position_y:, action_type:, value:)
  bot.nodes.create!(
    node_type: 'action',
    position_x: position_x,
    position_y: position_y,
    data: {
      actionType: action_type,
      value: value
    }
  )
end

def connect!(source, target)
  Connection.find_or_create_by!(source_node: source, target_node: target)
end

heuristic_bots = [
  {
    name: 'Avoid Hanging Move',
    description: 'Punishes moves where the moved piece is attacked after the move.',
    condition: {
      subject: 'moved_piece',
      subjectSpecifier: 'any',
      relation: 'attacker_count',
      relationSpecifier: 'any',
      comparison: 'any',
      comparisonValue: nil
    },
    action: {
      action_type: 'subtract',
      value: 5
    }
  },
  {
    name: 'Capture Queens',
    description: 'Strongly prefers moves that capture a queen.',
    condition: {
      subject: 'captured_piece',
      subjectSpecifier: 'queen',
      relation: 'piece_count',
      relationSpecifier: 'any',
      comparison: 'any',
      comparisonValue: nil
    },
    action: {
      action_type: 'add',
      value: 9
    }
  },
  {
    name: 'Unblock Allied Rooks',
    description: 'Prefers moves that increase an allied rook’s mobility.',
    condition: {
      subject: 'allies',
      subjectSpecifier: 'rook',
      relation: 'mobility',
      relationSpecifier: 'any',
      comparison: 'greater_than',
      comparisonValue: 'prior_board_state'
    },
    action: {
      action_type: 'add',
      value: 3
    }
  },
  {
    name: 'Protect Valuable Allies',
    description: 'Avoids moves that lower defender count for allied pieces.',
    condition: {
      subject: 'allies',
      subjectSpecifier: 'any',
      relation: 'defender_count',
      relationSpecifier: 'any',
      comparison: 'less_than',
      comparisonValue: 'prior_board_state'
    },
    action: {
      action_type: 'subtract',
      value: 4
    }
  }
]

heuristic_bots.each do |definition|
  bot = user.bots.find_or_initialize_by(name: definition[:name])
  bot.description = definition[:description]
  bot.save!

  reset_bot_graph!(bot)

  root = bot.root_node
  condition = create_condition!(
    bot: bot,
    position_x: 560,
    position_y: 180,
    data: definition[:condition]
  )
  action = create_action!(
    bot: bot,
    position_x: 560,
    position_y: 320,
    action_type: definition[:action][:action_type],
    value: definition[:action][:value]
  )

  connect!(root, condition)
  connect!(condition, action)
end

puts "Seeded #{heuristic_bots.length} prototype heuristic bots for #{seed_email}"
