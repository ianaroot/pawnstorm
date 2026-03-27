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

def create_branch!(bot:, root:, branch_index:, conditions:, action:)
  x = 220 + (branch_index * 180)
  y = 180
  previous_node = root

  conditions.each do |condition_data|
    condition = create_condition!(
      bot: bot,
      position_x: x,
      position_y: y,
      data: condition_data
    )
    connect!(previous_node, condition)
    previous_node = condition
    y += 120
  end

  action_node = create_action!(
    bot: bot,
    position_x: x,
    position_y: y,
    action_type: action[:action_type],
    value: action[:value]
  )
  connect!(previous_node, action_node)
end

seed_bots = [
  {
    name: 'Tactical Hunter',
    description: 'Finds immediate mate, grabs material, and increases pressure on the enemy king.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'none',
            comparisonValue: nil
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'return',
          value: 1000
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'queen',
            relation: 'piece_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'add',
          value: 9
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'piece_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'add',
          value: 3
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 4
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'shielded_count',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 3
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'subtract',
          value: 7
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender_count',
            relationSpecifier: 'any',
            comparison: 'none',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'subtract',
          value: 3
        }
      }
    ]
  },
  {
    name: 'Safety First Developer',
    description: 'Finds immediate mate, avoids hanging pieces, and improves king safety and coordination.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'none',
            comparisonValue: nil
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'return',
          value: 1000
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'subtract',
          value: 7
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'add',
          value: 2
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker_count',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 5
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'shielder_count',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 4
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'any',
            relation: 'defender_count',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'subtract',
          value: 4
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'rook',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 2
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'coverer_count',
            relationSpecifier: 'any',
            comparison: 'any',
            comparisonValue: nil
          }
        ],
        action: {
          action_type: 'add',
          value: 1
        }
      }
    ]
  }
]

seed_bots.each do |definition|
  bot = user.bots.find_or_initialize_by(name: definition[:name])
  bot.description = definition[:description]
  bot.save!

  reset_bot_graph!(bot)

  root = bot.root_node
  definition[:branches].each_with_index do |branch, index|
    create_branch!(
      bot: bot,
      root: root,
      branch_index: index,
      conditions: branch[:conditions],
      action: branch[:action]
    )
  end

  bot.compile_program!
end

puts "Seeded #{seed_bots.length} heuristic bots for #{seed_email}"
