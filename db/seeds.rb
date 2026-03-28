# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

seed_email = ENV.fetch('SEED_USER_EMAIL', 'ianaroot@gmail.com')
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

def cond(subject:, relation:, comparison:, comparison_value:, subject_specifier: 'any', relation_specifier: 'any')
  {
    subject: subject,
    subjectSpecifier: subject_specifier,
    relation: relation,
    relationSpecifier: relation_specifier,
    comparison: comparison,
    comparisonValue: comparison_value
  }
end

def branch(conditions:, action_type:, value:)
  {
    conditions: conditions,
    action: {
      action_type: action_type,
      value: value
    }
  }
end

def mate_branch(score: 1000)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'return',
    value: score
  )
end

def queen_capture_branch(score:)
  branch(
    conditions: [
      cond(subject: 'captured_piece', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1)
    ],
    action_type: 'return',
    value: score
  )
end

def winning_capture_branch(score:, defended: false, king_safety: nil)
  conditions = [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ]

  if defended
    conditions << cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  end

  case king_safety
  when :stable
    conditions << cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  when :improved
    conditions << cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  end

  branch(conditions: conditions, action_type: 'return', value: score)
end

def king_net_branch(score:, stable_king: false)
  conditions = [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]

  if stable_king
    conditions << cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  end

  branch(conditions: conditions, action_type: 'return', value: score)
end

def forcing_reply_branch(value:, defended: false)
  conditions = [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
  ]

  if defended
    conditions << cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  end

  branch(conditions: conditions, action_type: 'add', value: value)
end

def king_shelter_damage_branch(value:)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'add',
    value: value
  )
end

def development_branch(piece_type:, value:)
  branch(
    conditions: [
      cond(subject: 'allies', subject_specifier: piece_type, relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'add',
    value: value
  )
end

seed_bots = [
  {
    name: 'Tactician',
    description: 'Hunts for tactical motifs first: mate, fork-like multi-target pressure, royal fork/skewer proxies, pins by reduced king shielding, and direct king pressure.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
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
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 1
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 60
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'queen',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 55
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'rook',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 45
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 14
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 12
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 50
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 16
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
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
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: -120
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'knight',
            relation: 'mobility',
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
            subjectSpecifier: 'bishop',
            relation: 'mobility',
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
      }
    ]
  },
  {
    name: "King's Counsel",
    description: 'Values good tactics and wise captures, but only when the move keeps the king safe and the position structurally sane.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
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
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: -150
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: -120
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 10
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'coverer',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'covered',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'mobility',
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
            relation: 'coverer',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'covered',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: 20
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 35
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 1
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: 45
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'queen',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: 40
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'knight',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
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
            subjectSpecifier: 'bishop',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
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
            subjectSpecifier: 'rook',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 2
        }
      }
    ]
  },
  {
    name: 'Field Marshal',
    description: 'A disciplined tactician who still hunts motifs, but prefers coordinated pressure, supported attacks, and stable king conditions over speculative lunges.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
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
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: -140
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: 60
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 1
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: 52
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'queen',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 48
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 14
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'add',
          value: 12
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'knight',
            relation: 'mobility',
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
            subjectSpecifier: 'bishop',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 4
        }
      }
    ]
  },
  {
    name: 'Highwayman',
    description: 'A raider with tactical instincts: still alert to forks and royal pressure, but happiest when a supported move wins clean material.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
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
            relation: 'count',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 1
          }
        ],
        action: {
          action_type: 'add',
          value: 45
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          }
        ],
        action: {
          action_type: 'return',
          value: 55
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 70
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'queen',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 58
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'moved_piece',
            comparison: 'greater_than',
            comparisonValue: 1
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 54
        }
      },
      {
        conditions: [
          {
            subject: 'captured_piece',
            subjectSpecifier: 'rook',
            relation: 'count',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 1
          }
        ],
        action: {
          action_type: 'return',
          value: 52
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 10
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'allies',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'return',
          value: -120
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'knight',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
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
            subject: 'allies',
            subjectSpecifier: 'bishop',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 3
        }
      }
    ]
  },
  {
    name: 'Net Weaver',
    description: 'After clean material wins, prefers supported forcing moves that reduce the opponent king’s room, strip shelter, and tighten mating nets without leaving pieces hanging.',
    branches: [
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
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
            subjectSpecifier: 'any',
            relation: 'value',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'moved_piece_value'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 68
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 1
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 58
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 52
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'shielder',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'coverer',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: 48
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'covered',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'opponents',
            subjectSpecifier: 'king',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'add',
          value: 18
        }
      },
      {
        conditions: [
          {
            subject: 'opponents',
            subjectSpecifier: 'any',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'less_than',
            comparisonValue: 'prior_board_state'
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'add',
          value: 12
        }
      },
      {
        conditions: [
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'attacker',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 0
          },
          {
            subject: 'moved_piece',
            subjectSpecifier: 'any',
            relation: 'defender',
            relationSpecifier: 'any',
            comparison: 'equal_to',
            comparisonValue: 0
          }
        ],
        action: {
          action_type: 'return',
          value: -90
        }
      },
      {
        conditions: [
          {
            subject: 'allies',
            subjectSpecifier: 'knight',
            relation: 'mobility',
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
            subjectSpecifier: 'bishop',
            relation: 'mobility',
            relationSpecifier: 'any',
            comparison: 'greater_than',
            comparisonValue: 'prior_board_state'
          }
        ],
        action: {
          action_type: 'add',
          value: 4
        }
      }
    ]
  },
  {
    name: 'Taxman',
    description: 'Converts material first, then chokes the king, then prefers forcing moves. Development matters late, and king safety only after the loot and pressure questions are settled.',
    branches: [
      mate_branch,
      queen_capture_branch(score: 95),
      winning_capture_branch(score: 78, defended: true),
      winning_capture_branch(score: 62),
      king_net_branch(score: 52),
      king_shelter_damage_branch(value: 16),
      forcing_reply_branch(value: 14),
      {
        conditions: [
          cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'add',
          value: 10
        }
      },
      development_branch(piece_type: 'knight', value: 4),
      development_branch(piece_type: 'bishop', value: 4),
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'return',
          value: -18
        }
      }
    ]
  },
  {
    name: 'Castellan',
    description: 'Still converts material and hunts king nets, but treats king safety as a real constraint before drifting into quiet development.',
    branches: [
      mate_branch,
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
          cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 0)
        ],
        action: {
          action_type: 'return',
          value: -140
        }
      },
      winning_capture_branch(score: 72, defended: true),
      winning_capture_branch(score: 58, king_safety: :stable),
      king_net_branch(score: 48, stable_king: true),
      forcing_reply_branch(value: 14, defended: true),
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'add',
          value: 12
        }
      },
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'add',
          value: 8
        }
      },
      development_branch(piece_type: 'knight', value: 4),
      development_branch(piece_type: 'bishop', value: 4)
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
