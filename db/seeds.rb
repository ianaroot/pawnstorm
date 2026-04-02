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

def create_organizer!(bot:, position_x:, position_y:, title:, notes: '')
  bot.nodes.create!(
    node_type: 'organizer',
    position_x: position_x,
    position_y: position_y,
    data: {
      title: title,
      notes: notes
    }
  )
end

def create_path!(bot:, start_node:, x:, y:, conditions:, action_type:, value:, step_y: 150, zigzag_offset: 0)
  previous_node = start_node

  conditions.each_with_index do |condition_data, index|
    node_x =
      if zigzag_offset.zero?
        x
      else
        x + ((index % 2 == 1) ? zigzag_offset : 0)
      end

    condition = create_condition!(
      bot: bot,
      position_x: node_x,
      position_y: y + (index * step_y),
      data: condition_data
    )
    connect!(previous_node, condition)
    previous_node = condition
  end

  action_x =
    if zigzag_offset.zero?
      x
    else
      x + ((conditions.length % 2 == 1) ? zigzag_offset : 0)
    end

  action_node = create_action!(
    bot: bot,
    position_x: action_x,
    position_y: y + (conditions.length * step_y),
    action_type: action_type,
    value: value
  )
  connect!(previous_node, action_node)
end

def clone_bot_graph!(source_bot:, target_bot:)
  reset_bot_graph!(target_bot)

  source_root = source_bot.root_node
  target_root = target_bot.root_node
  node_map = { source_root.id => target_root }

  source_bot.nodes.where.not(node_type: 'root').find_each do |node|
    node_map[node.id] = target_bot.nodes.create!(
      node_type: node.node_type,
      position_x: node.position_x,
      position_y: node.position_y,
      data: node.data.deep_dup
    )
  end

  source_bot.nodes.find_each do |node|
    node.outgoing_connections.find_each do |connection|
      connect!(node_map[connection.source_node_id], node_map[connection.target_node_id])
    end
  end
end

def cond(
  subject:,
  relation:,
  comparison:,
  comparison_value:,
  subject_specifier: 'any',
  subject_specifier_mode: 'include',
  relation_specifier: 'any',
  relation_specifier_mode: 'include'
)
  {
    subject: subject,
    subjectSpecifier: subject_specifier,
    subjectSpecifierMode: subject_specifier_mode,
    relation: relation,
    relationSpecifier: relation_specifier,
    relationSpecifierMode: relation_specifier_mode,
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

def opening_game_conditions
  [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 8),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'opponents', subject_specifier: 'rook', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'bishop', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'knight', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 8),
    cond(subject: 'allies', relation: 'attacked', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', relation: 'attacked', comparison: 'equal_to', comparison_value: 0)
  ]
end

def endgame_gate_conditions
  [
    cond(subject: 'allies', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3)
  ]
end

def pressure_safety_condition_sets
  [
    [
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    [
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    [
      cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'rook', comparison: 'greater_than', comparison_value: 0)
    ],
    [
      cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 0)
    ]
  ]
end

def opening_minor_development_branch(piece_type:, attacker_comparison:, score:)
  branch(
    conditions: opening_game_conditions + [
      cond(subject: 'moved_piece', subject_specifier: piece_type, relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', subject_specifier: piece_type, relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: attacker_comparison, comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'return',
    value: score
  )
end

def knight_fork_branch(score:, safe:)
  safety_condition =
    case safe
    when :defended
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    when :unattacked
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    else
      raise ArgumentError, "Unknown knight fork safety: #{safe}"
    end

  branch(
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
      safety_condition
    ],
    action_type: 'return',
    value: score
  )
end

def queen_skewer_branch(score:)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'return',
    value: score
  )
end

def king_pin_branch(score:, pawn_attack_comparison:)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: pawn_attack_comparison, comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: score
  )
end

def queen_pin_branch(score:, pawn_attack_comparison:)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: pawn_attack_comparison, comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: score
  )
end

def rook_pin_branch(score:, pawn_attack_comparison:)
  branch(
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: pawn_attack_comparison, comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: score
  )
end

def endgame_protect_pawns_branch(score:, attacker_comparison:)
  branch(
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
      cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
      cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: attacker_comparison, comparison_value: 'prior_board_state'),
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: score
  )
end

def endgame_pawn_capture_branch(score:, safe:)
  safety_condition =
    case safe
    when :defended
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    when :unattacked
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    else
      raise ArgumentError, "Unknown endgame pawn capture safety: #{safe}"
    end

  branch(
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
      cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
      cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
      safety_condition
    ],
    action_type: 'return',
    value: score
  )
end

def safe_activity_branch(value:, piece_type: 'any')
  branch(
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: piece_type, relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'add',
    value: value
  )
end

def safe_supported_activity_branch(value:, piece_type: 'any')
  branch(
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: piece_type, relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: value
  )
end

def safer_king_branch(value:)
  branch(
    conditions: [
      cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'add',
    value: value
  )
end

def improved_pawn_protection_branch(value:)
  branch(
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'add',
    value: value
  )
end

def queen_hanging_branch(score:)
  branch(
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'return',
    value: score
  )
end

def queen_newly_exposed_branch(score:)
  branch(
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'return',
    value: score
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
  },
  {
    name: 'Needle',
    description: 'A sharp tactician that now respects game phase: develop safely in the opening, punish with forks/skewers/pins in the middlegame, and cash endgame pawn captures before falling back on safe pressure and activity.',
    branches: [
      mate_branch,
      queen_hanging_branch(score: -220),
      queen_newly_exposed_branch(score: -120),
      winning_capture_branch(score: 82, defended: true),
      winning_capture_branch(score: 68),
      opening_minor_development_branch(piece_type: 'knight', attacker_comparison: 'less_than', score: 28),
      opening_minor_development_branch(piece_type: 'knight', attacker_comparison: 'equal_to', score: 24),
      opening_minor_development_branch(piece_type: 'bishop', attacker_comparison: 'less_than', score: 28),
      opening_minor_development_branch(piece_type: 'bishop', attacker_comparison: 'equal_to', score: 24),
      knight_fork_branch(score: 60, safe: :defended),
      knight_fork_branch(score: 56, safe: :unattacked),
      queen_skewer_branch(score: 52),
      king_pin_branch(score: 46, pawn_attack_comparison: 'less_than'),
      king_pin_branch(score: 42, pawn_attack_comparison: 'equal_to'),
      queen_pin_branch(score: 34, pawn_attack_comparison: 'less_than'),
      queen_pin_branch(score: 30, pawn_attack_comparison: 'equal_to'),
      rook_pin_branch(score: 28, pawn_attack_comparison: 'less_than'),
      rook_pin_branch(score: 24, pawn_attack_comparison: 'equal_to'),
      endgame_pawn_capture_branch(score: 42, safe: :defended),
      endgame_pawn_capture_branch(score: 38, safe: :unattacked),
      endgame_protect_pawns_branch(score: 26, attacker_comparison: 'less_than'),
      endgame_protect_pawns_branch(score: 22, attacker_comparison: 'equal_to'),
      king_net_branch(score: 40, stable_king: true),
      safe_supported_activity_branch(value: 12),
      safe_activity_branch(value: 9),
      improved_pawn_protection_branch(value: 7),
      safer_king_branch(value: 6),
      {
        conditions: [
          cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
          cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 0),
          cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action: {
          action_type: 'return',
          value: -140
        }
      }
    ]
  },
  {
    name: 'Steward',
    description: 'A more strategic planner that recognizes opening and endgame states, values safe pawn captures in reduced material, and carries a larger fallback stack of sane activity, king safety, and pawn-protection improvements.',
    branches: [
      mate_branch,
      queen_hanging_branch(score: -240),
      queen_newly_exposed_branch(score: -140),
      winning_capture_branch(score: 74, defended: true, king_safety: :stable),
      queen_skewer_branch(score: 44),
      knight_fork_branch(score: 46, safe: :defended),
      opening_minor_development_branch(piece_type: 'knight', attacker_comparison: 'less_than', score: 26),
      opening_minor_development_branch(piece_type: 'knight', attacker_comparison: 'equal_to', score: 22),
      opening_minor_development_branch(piece_type: 'bishop', attacker_comparison: 'less_than', score: 26),
      opening_minor_development_branch(piece_type: 'bishop', attacker_comparison: 'equal_to', score: 22),
      endgame_pawn_capture_branch(score: 34, safe: :defended),
      endgame_pawn_capture_branch(score: 30, safe: :unattacked),
      endgame_protect_pawns_branch(score: 24, attacker_comparison: 'less_than'),
      endgame_protect_pawns_branch(score: 20, attacker_comparison: 'equal_to'),
      king_net_branch(score: 34, stable_king: true),
      king_shelter_damage_branch(value: 10),
      improved_pawn_protection_branch(value: 9),
      safe_supported_activity_branch(value: 8),
      safe_activity_branch(value: 6),
      safer_king_branch(value: 6),
      development_branch(piece_type: 'rook', value: 3),
      {
        conditions: [
          cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
          cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 0)
        ],
        action: {
          action_type: 'return',
          value: -120
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

vise = user.bots.find_or_initialize_by(name: 'Bishop')
vise.description = 'A pressure-and-conversion bot that opens sanely, squeezes king safety with explicit trade-aware pressure, and stays purposeful in endgames through pawn conversion and steady fallback play.'
vise.save!

reset_bot_graph!(vise)

vise_root = vise.root_node

terminal_organizer = create_organizer!(bot: vise, position_x: 120, position_y: 120, title: 'Terminal')
opening_organizer = create_organizer!(bot: vise, position_x: 760, position_y: 120, title: 'Opening')
tactics_organizer = create_organizer!(bot: vise, position_x: 460, position_y: 1730, title: 'Tactics')
pressure_organizer = create_organizer!(bot: vise, position_x: 1880, position_y: 980, title: 'King Pressure')
endgame_organizer = create_organizer!(bot: vise, position_x: 2850, position_y: 760, title: 'Endgame')
fallback_organizer = create_organizer!(bot: vise, position_x: 3900, position_y: 1260, title: 'Fallback')

[terminal_organizer, opening_organizer, tactics_organizer, pressure_organizer, endgame_organizer, fallback_organizer].each do |organizer|
  connect!(vise_root, organizer)
end

create_path!(
  bot: vise,
  start_node: terminal_organizer,
  x: 80,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: vise,
  start_node: terminal_organizer,
  x: 300,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

opening_knight_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 660,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_knight_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 900,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_knight_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

opening_bishop_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 1140,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_bishop_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 1380,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_bishop_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

opening_pawn_support_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 1620,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 1860,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 2100,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: vise,
  start_node: opening_organizer,
  x: 2340,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: vise,
  start_node: tactics_organizer,
  x: 360,
  y: 1890,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 110
)

create_path!(
  bot: vise,
  start_node: tactics_organizer,
  x: 620,
  y: 1890,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: vise,
  start_node: tactics_organizer,
  x: 900,
  y: 1890,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

create_path!(
  bot: vise,
  start_node: tactics_organizer,
  x: 1140,
 y: 1890,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

strip_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state')
]

forcing_core = [
  cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
]

pressure_safety_condition_sets.each_with_index do |safety_conditions, index|
  base_x = 1740 + (index * 230)

  create_path!(
    bot: vise,
    start_node: pressure_organizer,
    x: base_x,
    y: 1140,
    zigzag_offset: 70,
    conditions: tighten_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: vise,
    start_node: pressure_organizer,
    x: base_x,
    y: 1710,
    zigzag_offset: 70,
    conditions: strip_core + safety_conditions,
    action_type: 'return',
    value: 30
  )

  create_path!(
    bot: vise,
    start_node: pressure_organizer,
    x: base_x,
    y: 2280,
    zigzag_offset: 70,
    conditions: forcing_core + safety_conditions,
    action_type: 'add',
    value: 14
  )
end

endgame_base = endgame_gate_conditions

create_path!(
  bot: vise,
  start_node: endgame_organizer,
  x: 2720,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 95
)

create_path!(
  bot: vise,
  start_node: endgame_organizer,
  x: 2960,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 95
)

create_path!(
  bot: vise,
  start_node: endgame_organizer,
  x: 3200,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 24
)

create_path!(
  bot: vise,
  start_node: endgame_organizer,
  x: 3440,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

create_path!(
  bot: vise,
  start_node: endgame_organizer,
  x: 3680,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

pressure_safety_condition_sets.each_with_index do |safety_conditions, index|
  base_x = 3920 + (index * 230)

  create_path!(
    bot: vise,
    start_node: endgame_organizer,
    x: base_x,
    y: 1550,
    zigzag_offset: 70,
    conditions: endgame_base + tighten_core + safety_conditions,
    action_type: 'return',
    value: 28
  )
end

controlled_tension_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 3860,
  y: 1420,
  zigzag_offset: 70,
  conditions: controlled_tension_base + [
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', relation_specifier_mode: 'exclude', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 4120,
  y: 1420,
  zigzag_offset: 70,
  conditions: controlled_tension_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 4380,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 4640,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 4900,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 5160,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: vise,
  start_node: fallback_organizer,
  x: 5420,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 8
)

vise.compile_program!

gambit = user.bots.find_or_initialize_by(name: 'Gambit')
gambit.description = 'A tactical hunter that builds attacking structure with supportive pawn moves, seeks forks, skewers, and pins before slow pressure, and still carries opening and endgame plans so it stays dangerous after simplification.'
gambit.save!

reset_bot_graph!(gambit)

gambit_root = gambit.root_node

gambit_terminal = create_organizer!(bot: gambit, position_x: 120, position_y: 120, title: 'Terminal')
gambit_opening = create_organizer!(bot: gambit, position_x: 760, position_y: 120, title: 'Opening')
gambit_tactics = create_organizer!(bot: gambit, position_x: 520, position_y: 1820, title: 'Tactics')
gambit_pressure = create_organizer!(bot: gambit, position_x: 2040, position_y: 1180, title: 'King Pressure')
gambit_endgame = create_organizer!(bot: gambit, position_x: 3020, position_y: 880, title: 'Endgame')
gambit_fallback = create_organizer!(bot: gambit, position_x: 4040, position_y: 1360, title: 'Fallback')

[gambit_terminal, gambit_opening, gambit_tactics, gambit_pressure, gambit_endgame, gambit_fallback].each do |organizer|
  connect!(gambit_root, organizer)
end

create_path!(
  bot: gambit,
  start_node: gambit_terminal,
  x: 80,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: gambit,
  start_node: gambit_terminal,
  x: 300,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

gambit_opening_knight = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 660,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 13
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 900,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 13
)

gambit_opening_bishop = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 1140,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 1380,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

gambit_pawn_chain_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'defender', relation_specifier: 'pawn', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
]

gambit_pawn_frees_bishop = gambit_pawn_chain_base + [
  cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

gambit_pawn_supports_knight = gambit_pawn_chain_base + [
  cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 1620,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_frees_bishop + [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 1860,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_frees_bishop + [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 2100,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_frees_bishop + [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 2340,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_frees_bishop + [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 2580,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_supports_knight + [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 9
)

create_path!(
  bot: gambit,
  start_node: gambit_opening,
  x: 2820,
  y: 280,
  zigzag_offset: 80,
  conditions: gambit_pawn_supports_knight + [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 9
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 420,
  y: 1980,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 110
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 680,
  y: 1980,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 940,
  y: 1980,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 60
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 1180,
  y: 1980,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 60
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 1440,
  y: 1980,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 52
)

queen_pin_base = [
  cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 1700,
  y: 1980,
  zigzag_offset: 60,
  conditions: queen_pin_base + [
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 34
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 1960,
  y: 1980,
  zigzag_offset: 60,
  conditions: queen_pin_base + [
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 34
)

rook_pin_base = [
  cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 2220,
  y: 1980,
  zigzag_offset: 60,
  conditions: rook_pin_base + [
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 28
)

create_path!(
  bot: gambit,
  start_node: gambit_tactics,
  x: 2480,
  y: 1980,
  zigzag_offset: 60,
  conditions: rook_pin_base + [
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 28
)

gambit_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

gambit_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

gambit_strip_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state')
]

gambit_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 1920 + (index * 260)

  create_path!(
    bot: gambit,
    start_node: gambit_pressure,
    x: base_x,
    y: 1340,
    zigzag_offset: 70,
    conditions: gambit_tighten_core + safety_conditions,
    action_type: 'return',
    value: 30
  )

  create_path!(
    bot: gambit,
    start_node: gambit_pressure,
    x: base_x,
    y: 1910,
    zigzag_offset: 70,
    conditions: gambit_strip_core + safety_conditions,
    action_type: 'return',
    value: 26
  )
end

gambit_endgame_base = endgame_gate_conditions

create_path!(
  bot: gambit,
  start_node: gambit_endgame,
  x: 2900,
  y: 1040,
  zigzag_offset: 70,
  conditions: gambit_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 90
)

create_path!(
  bot: gambit,
  start_node: gambit_endgame,
  x: 3160,
  y: 1040,
  zigzag_offset: 70,
  conditions: gambit_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 90
)

create_path!(
  bot: gambit,
  start_node: gambit_endgame,
  x: 3420,
  y: 1040,
  zigzag_offset: 70,
  conditions: gambit_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: gambit,
  start_node: gambit_endgame,
  x: 3680,
  y: 1040,
  zigzag_offset: 70,
  conditions: gambit_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: gambit,
  start_node: gambit_endgame,
  x: 3940,
  y: 1040,
  zigzag_offset: 70,
  conditions: gambit_endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 3940,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', relation_specifier_mode: 'exclude', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 4220,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 4500,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 4780,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 5040,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 5300,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 5560,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 5820,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 6080,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

gambit_pawn_support_base = [
  cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 6340,
  y: 1520,
  zigzag_offset: 70,
  conditions: gambit_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 6600,
  y: 1520,
  zigzag_offset: 70,
  conditions: gambit_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 6860,
  y: 1520,
  zigzag_offset: 70,
  conditions: gambit_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 7120,
  y: 1520,
  zigzag_offset: 70,
  conditions: gambit_pawn_support_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 7380,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 7640,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: gambit,
  start_node: gambit_fallback,
  x: 7900,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

gambit.compile_program!

storm = user.bots.find_or_initialize_by(name: 'Storm')
storm.description = 'A balanced bot that values clean development, strategic queen use, coordinated piece safety, and practical endgame play without giving up obvious tactics.'
storm.save!

reset_bot_graph!(storm)

storm_root = storm.root_node

storm_terminal = create_organizer!(bot: storm, position_x: 120, position_y: 120, title: 'Terminal')
storm_opening = create_organizer!(bot: storm, position_x: 820, position_y: 120, title: 'Opening')
storm_tactics = create_organizer!(bot: storm, position_x: 560, position_y: 1780, title: 'Tactics')
storm_queen = create_organizer!(bot: storm, position_x: 1960, position_y: 220, title: 'Queen Strategy')
storm_pressure = create_organizer!(bot: storm, position_x: 2200, position_y: 1320, title: 'King Pressure')
storm_endgame = create_organizer!(bot: storm, position_x: 3240, position_y: 900, title: 'Endgame')
storm_fallback = create_organizer!(bot: storm, position_x: 4380, position_y: 1280, title: 'Fallback')

[storm_terminal, storm_opening, storm_tactics, storm_queen, storm_pressure, storm_endgame, storm_fallback].each do |organizer|
  connect!(storm_root, organizer)
end

create_path!(
  bot: storm,
  start_node: storm_terminal,
  x: 80,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: storm,
  start_node: storm_terminal,
  x: 300,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

storm_opening_knight = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 940,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

storm_opening_bishop = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 1180,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 1420,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

storm_opening_pawn_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 1660,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 1900,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 2140,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_opening,
  x: 2380,
  y: 280,
  zigzag_offset: 80,
  conditions: storm_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_tactics,
  x: 420,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 110
)

create_path!(
  bot: storm,
  start_node: storm_tactics,
  x: 680,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: storm,
  start_node: storm_tactics,
  x: 940,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

create_path!(
  bot: storm,
  start_node: storm_tactics,
  x: 1180,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

create_path!(
  bot: storm,
  start_node: storm_tactics,
  x: 1440,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 46
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 80
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 2080,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 80
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 2340,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 2600,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 10
)

storm_queen_coordination_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
]

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 2860,
  y: 380,
  zigzag_offset: 70,
  conditions: storm_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 3120,
  y: 380,
  zigzag_offset: 70,
  conditions: storm_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 3380,
  y: 380,
  zigzag_offset: 70,
  conditions: storm_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 3640,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 3900,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: storm,
  start_node: storm_queen,
  x: 4160,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

storm_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

storm_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

storm_strip_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state')
]

storm_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 2100 + (index * 280)

  create_path!(
    bot: storm,
    start_node: storm_pressure,
    x: base_x,
    y: 1480,
    zigzag_offset: 70,
    conditions: storm_tighten_core + safety_conditions,
    action_type: 'return',
    value: 24
  )

  create_path!(
    bot: storm,
    start_node: storm_pressure,
    x: base_x,
    y: 2050,
    zigzag_offset: 70,
    conditions: storm_strip_core + safety_conditions,
    action_type: 'return',
    value: 20
  )
end

storm_endgame_base = endgame_gate_conditions

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 3120,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 3380,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 3640,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 3900,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 4160,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 4420,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 4680,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_endgame,
  x: 4940,
  y: 1060,
  zigzag_offset: 70,
  conditions: storm_endgame_base + [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

storm_supported_activity_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 4260,
  y: 1440,
  zigzag_offset: 70,
  conditions: storm_supported_activity_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 4520,
  y: 1440,
  zigzag_offset: 70,
  conditions: storm_supported_activity_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 4780,
  y: 1440,
  zigzag_offset: 70,
  conditions: storm_supported_activity_base + [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'rook', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 5040,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 5300,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 5560,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 5820,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6080,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6340,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6600,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6860,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6080,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6340,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6600,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 6860,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: storm,
  start_node: storm_fallback,
  x: 7120,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

storm.compile_program!

rogue = user.bots.find_or_initialize_by(name: 'Rogue')
rogue.description = 'A Storm iteration that keeps the same balanced opening and safety instincts, but pushes much harder to reduce king mobility, force replies, and convert pressure into mate.'
rogue.save!

reset_bot_graph!(rogue)

rogue_root = rogue.root_node

rogue_terminal = create_organizer!(bot: rogue, position_x: 120, position_y: 120, title: 'Terminal')
rogue_opening = create_organizer!(bot: rogue, position_x: 820, position_y: 120, title: 'Opening')
rogue_tactics = create_organizer!(bot: rogue, position_x: 560, position_y: 1780, title: 'Tactics')
rogue_queen = create_organizer!(bot: rogue, position_x: 1960, position_y: 220, title: 'Queen Strategy')
rogue_pressure = create_organizer!(bot: rogue, position_x: 2200, position_y: 1320, title: 'King Pressure')
rogue_endgame = create_organizer!(bot: rogue, position_x: 3360, position_y: 900, title: 'Endgame')
rogue_fallback = create_organizer!(bot: rogue, position_x: 4580, position_y: 1280, title: 'Fallback')

[rogue_terminal, rogue_opening, rogue_tactics, rogue_queen, rogue_pressure, rogue_endgame, rogue_fallback].each do |organizer|
  connect!(rogue_root, organizer)
end

create_path!(
  bot: rogue,
  start_node: rogue_terminal,
  x: 80,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: rogue,
  start_node: rogue_terminal,
  x: 300,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

rogue_opening_knight = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 940,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_knight + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

rogue_opening_bishop = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 1180,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 1420,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_bishop + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 11
)

rogue_opening_pawn_base = opening_game_conditions + [
  cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 1660,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 1900,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 2140,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_opening,
  x: 2380,
  y: 280,
  zigzag_offset: 80,
  conditions: rogue_opening_pawn_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 420,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 110
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 680,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 940,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 92
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 1200,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 1440,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 55
)

create_path!(
  bot: rogue,
  start_node: rogue_tactics,
  x: 1700,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 46
)

rogue_tactical_strike_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 0)
  ],
  [cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)],
  [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 0)
  ],
  [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 0)
  ],
  [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'rook', comparison: 'greater_than', comparison_value: 0)
  ],
  [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 0)
  ]
]

rogue_queen_behind_king_core = [
  cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_rook_behind_king_core = [
  cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_rook_behind_queen_core = [
  cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_queen_behind_bishop_core = [
  cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_queen_behind_knight_core = [
  cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_rook_behind_bishop_core = [
  cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_rook_behind_knight_core = [
  cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_tactical_strike_safety.each_with_index do |safety_conditions, index|
  base_x = 1960 + (index * 260)

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x,
    y: 1940,
    zigzag_offset: 60,
    conditions: rogue_queen_behind_king_core + safety_conditions,
    action_type: 'return',
    value: 48
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 520,
    y: 1940,
    zigzag_offset: 60,
    conditions: rogue_rook_behind_king_core + safety_conditions,
    action_type: 'return',
    value: 40
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 1040,
    y: 1940,
    zigzag_offset: 60,
    conditions: rogue_queen_behind_bishop_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 1560,
    y: 1940,
    zigzag_offset: 60,
    conditions: rogue_queen_behind_knight_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 1040,
    y: 2510,
    zigzag_offset: 60,
    conditions: rogue_rook_behind_queen_core + safety_conditions,
    action_type: 'return',
    value: 28
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 1560,
    y: 2510,
    zigzag_offset: 60,
    conditions: rogue_rook_behind_bishop_core + safety_conditions,
    action_type: 'return',
    value: 26
  )

  create_path!(
    bot: rogue,
    start_node: rogue_tactics,
    x: base_x + 2080,
    y: 2510,
    zigzag_offset: 60,
    conditions: rogue_rook_behind_knight_core + safety_conditions,
    action_type: 'return',
    value: 26
  )
end

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 80
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 2080,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 80
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 2340,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 2600,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

rogue_queen_coordination_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 2860,
  y: 380,
  zigzag_offset: 70,
  conditions: rogue_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 3120,
  y: 380,
  zigzag_offset: 70,
  conditions: rogue_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 3380,
  y: 380,
  zigzag_offset: 70,
  conditions: rogue_queen_coordination_base + [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 3640,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 3900,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: rogue,
  start_node: rogue_queen,
  x: 4160,
  y: 380,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

rogue_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

rogue_shelter_break_safety = rogue_tactical_strike_safety

rogue_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_shelter_break_shielder_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
]

rogue_shelter_break_coverer_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
]

rogue_drive_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
]

rogue_forcing_core = [
  cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
]

rogue_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 2100 + (index * 280)

  create_path!(
    bot: rogue,
    start_node: rogue_pressure,
    x: base_x,
    y: 1480,
    zigzag_offset: 70,
    conditions: rogue_tighten_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: rogue,
    start_node: rogue_pressure,
    x: base_x + 620,
    y: 1480,
    zigzag_offset: 70,
    conditions: rogue_drive_core + safety_conditions,
    action_type: 'add',
    value: 12
  )

  create_path!(
    bot: rogue,
    start_node: rogue_pressure,
    x: base_x + 620,
    y: 2050,
    zigzag_offset: 70,
    conditions: rogue_forcing_core + safety_conditions,
    action_type: 'add',
    value: 16
  )
end

rogue_shelter_break_safety.each_with_index do |safety_conditions, index|
  base_x = 2940 + (index * 240)

  create_path!(
    bot: rogue,
    start_node: rogue_pressure,
    x: base_x,
    y: 2620,
    zigzag_offset: 70,
    conditions: rogue_shelter_break_shielder_core + safety_conditions,
    action_type: 'return',
    value: 32
  )

  create_path!(
    bot: rogue,
    start_node: rogue_pressure,
    x: base_x,
    y: 3190,
    zigzag_offset: 70,
    conditions: rogue_shelter_break_coverer_core + safety_conditions,
    action_type: 'return',
    value: 32
  )
end

rogue_endgame_base = endgame_gate_conditions

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 3240,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 3500,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 3760,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 4020,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 22
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 4280,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 4540,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

rogue_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 4800 + (index * 280)

  create_path!(
    bot: rogue,
    start_node: rogue_endgame,
    x: base_x,
    y: 1060,
    zigzag_offset: 70,
    conditions: rogue_endgame_base + rogue_tighten_core + safety_conditions,
    action_type: 'return',
    value: 32
  )
end

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 5360,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_endgame,
  x: 5620,
  y: 1060,
  zigzag_offset: 70,
  conditions: rogue_endgame_base + [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 8
)

rogue_supported_activity_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 4460,
  y: 1440,
  zigzag_offset: 70,
  conditions: rogue_supported_activity_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 4720,
  y: 1440,
  zigzag_offset: 70,
  conditions: rogue_supported_activity_base + [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 4980,
  y: 1440,
  zigzag_offset: 70,
  conditions: rogue_supported_activity_base + [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 5240,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 5500,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 5760,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6020,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6280,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6540,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6800,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7060,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6280,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6540,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 6800,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7060,
  y: 2010,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7320,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7320,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7580,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 6
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 7840,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 8100,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 8360,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 8620,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 8880,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 9140,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 14
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 9400,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 9660,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 9920,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 10180,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: rogue,
  start_node: rogue_fallback,
  x: 10440,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 8
)

rogue.compile_program!

phoenix = user.bots.find_or_initialize_by(name: 'Phoenix')
phoenix.description = 'A Rogue derivative that keeps the same tactical spine, but is more disciplined about avoiding cheap queen harassment and more eager to bring supporting pieces into mating nets.'
phoenix.save!

clone_bot_graph!(source_bot: rogue, target_bot: phoenix)

phoenix_root = phoenix.root_node
phoenix_conversion = create_organizer!(bot: phoenix, position_x: 10880, position_y: 1080, title: 'Phoenix Conversion')
phoenix_discipline = create_organizer!(bot: phoenix, position_x: 11380, position_y: 1080, title: 'Phoenix Discipline')

connect!(phoenix_root, phoenix_conversion)
connect!(phoenix_root, phoenix_discipline)

phoenix_conversion_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

phoenix_helper_constriction_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

phoenix_helper_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

phoenix_conversion_safety.each_with_index do |safety_conditions, index|
  base_x = 10740 + (index * 300)

  create_path!(
    bot: phoenix,
    start_node: phoenix_conversion,
    x: base_x,
    y: 1240,
    zigzag_offset: 70,
    conditions: phoenix_helper_constriction_core + safety_conditions,
    action_type: 'return',
    value: 24
  )

  create_path!(
    bot: phoenix,
    start_node: phoenix_conversion,
    x: base_x + 620,
    y: 1240,
    zigzag_offset: 70,
    conditions: phoenix_helper_box_core + safety_conditions,
    action_type: 'return',
    value: 22
  )

  create_path!(
    bot: phoenix,
    start_node: phoenix_conversion,
    x: base_x + 1240,
    y: 1240,
    zigzag_offset: 70,
    conditions: endgame_gate_conditions + phoenix_helper_constriction_core + safety_conditions,
    action_type: 'return',
    value: 36
  )
end

create_path!(
  bot: phoenix,
  start_node: phoenix_discipline,
  x: 11240,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

create_path!(
  bot: phoenix,
  start_node: phoenix_discipline,
  x: 11500,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

create_path!(
  bot: phoenix,
  start_node: phoenix_discipline,
  x: 11760,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

phoenix.compile_program!

cyclops = user.bots.find_or_initialize_by(name: 'Cyclops')
cyclops.description = 'A single-minded king hunter that borrows Rogue’s best forcing ideas, but uses a narrower, more support-driven attack plan and a simpler fallback spine.'
cyclops.save!

reset_bot_graph!(cyclops)

cyclops_root = cyclops.root_node

cyclops_terminal = create_organizer!(bot: cyclops, position_x: 120, position_y: 4080, title: 'Terminal')
cyclops_opening = create_organizer!(bot: cyclops, position_x: 780, position_y: 4080, title: 'Opening')
cyclops_tactics = create_organizer!(bot: cyclops, position_x: 1600, position_y: 4080, title: 'Tactics')
cyclops_pressure = create_organizer!(bot: cyclops, position_x: 2580, position_y: 4080, title: 'Pressure')
cyclops_endgame = create_organizer!(bot: cyclops, position_x: 3840, position_y: 4080, title: 'Endgame')
cyclops_fallback = create_organizer!(bot: cyclops, position_x: 4980, position_y: 4080, title: 'Fallback')

[cyclops_terminal, cyclops_opening, cyclops_tactics, cyclops_pressure, cyclops_endgame, cyclops_fallback].each do |organizer|
  connect!(cyclops_root, organizer)
end

create_path!(
  bot: cyclops,
  start_node: cyclops_terminal,
  x: 80,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: cyclops,
  start_node: cyclops_terminal,
  x: 340,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_path!(
  bot: cyclops,
  start_node: cyclops_opening,
  x: 700,
  y: 4240,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 14
)

create_path!(
  bot: cyclops,
  start_node: cyclops_opening,
  x: 960,
  y: 4240,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 13
)

create_path!(
  bot: cyclops,
  start_node: cyclops_opening,
  x: 1220,
  y: 4240,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 9
)

create_path!(
  bot: cyclops,
  start_node: cyclops_opening,
  x: 1480,
  y: 4240,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 1520,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 110
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 1780,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 2040,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 90
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 2300,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 58
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 2560,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 48
)

create_path!(
  bot: cyclops,
  start_node: cyclops_tactics,
  x: 2820,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 44
)

cyclops_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

cyclops_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

cyclops_helper_pressure_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

cyclops_helper_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

cyclops_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 2480 + (index * 300)

  create_path!(
    bot: cyclops,
    start_node: cyclops_pressure,
    x: base_x,
    y: 4240,
    zigzag_offset: 70,
    conditions: cyclops_tighten_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: cyclops,
    start_node: cyclops_pressure,
    x: base_x + 620,
    y: 4240,
    zigzag_offset: 70,
    conditions: cyclops_helper_pressure_core + safety_conditions,
    action_type: 'return',
    value: 24
  )

  create_path!(
    bot: cyclops,
    start_node: cyclops_pressure,
    x: base_x + 1240,
    y: 4240,
    zigzag_offset: 70,
    conditions: cyclops_helper_box_core + safety_conditions,
    action_type: 'return',
    value: 22
  )

  create_path!(
    bot: cyclops,
    start_node: cyclops_pressure,
    x: base_x + 1860,
    y: 4240,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
    ] + safety_conditions,
    action_type: 'add',
    value: 16
  )
end

create_path!(
  bot: cyclops,
  start_node: cyclops_pressure,
  x: 3720,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 14
)

create_path!(
  bot: cyclops,
  start_node: cyclops_pressure,
  x: 3980,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 14
)

create_path!(
  bot: cyclops,
  start_node: cyclops_endgame,
  x: 3780,
  y: 4240,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: cyclops,
  start_node: cyclops_endgame,
  x: 4040,
  y: 4240,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

cyclops_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 4300 + (index * 300)

  create_path!(
    bot: cyclops,
    start_node: cyclops_endgame,
    x: base_x,
    y: 4240,
    zigzag_offset: 70,
    conditions: endgame_gate_conditions + cyclops_tighten_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: cyclops,
    start_node: cyclops_endgame,
    x: base_x + 620,
    y: 4240,
    zigzag_offset: 70,
    conditions: endgame_gate_conditions + cyclops_helper_pressure_core + safety_conditions,
    action_type: 'return',
    value: 36
  )
end

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 4900,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 5160,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 5420,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 5680,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 5940,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 6200,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 6460,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 6720,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 6980,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: cyclops,
  start_node: cyclops_fallback,
  x: 7240,
  y: 4240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

cyclops.compile_program!

nightcrawler = user.bots.find_or_initialize_by(name: 'Nightcrawler')
nightcrawler.description = 'An opportunistic hunter that jumps on newly loose pieces, tempo-gaining attacks, and tactical punishments more readily than the more positional bots.'
nightcrawler.save!

reset_bot_graph!(nightcrawler)

nightcrawler_root = nightcrawler.root_node

nightcrawler_terminal = create_organizer!(bot: nightcrawler, position_x: 120, position_y: 6540, title: 'Terminal')
nightcrawler_opening = create_organizer!(bot: nightcrawler, position_x: 860, position_y: 6540, title: 'Opening')
nightcrawler_tactics = create_organizer!(bot: nightcrawler, position_x: 1780, position_y: 6540, title: 'Punish')
nightcrawler_pressure = create_organizer!(bot: nightcrawler, position_x: 3240, position_y: 6540, title: 'Pressure')
nightcrawler_fallback = create_organizer!(bot: nightcrawler, position_x: 4720, position_y: 6540, title: 'Fallback')

[nightcrawler_terminal, nightcrawler_opening, nightcrawler_tactics, nightcrawler_pressure, nightcrawler_fallback].each do |organizer|
  connect!(nightcrawler_root, organizer)
end

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_terminal,
  x: 80,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_terminal,
  x: 340,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_opening,
  x: 760,
  y: 6700,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 14
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_opening,
  x: 1020,
  y: 6700,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 13
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_opening,
  x: 1280,
  y: 6700,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 1680,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 112
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 1940,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  action_type: 'return',
  value: 102
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 2200,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  action_type: 'return',
  value: 96
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 2460,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 60
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 2720,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 2980,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'defended', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_tactics,
  x: 3240,
  y: 6700,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 50
)

nightcrawler_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

nightcrawler_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 3140 + (index * 320)

  create_path!(
    bot: nightcrawler,
    start_node: nightcrawler_pressure,
    x: base_x,
    y: 6700,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ] + safety_conditions,
    action_type: 'return',
    value: 30
  )

  create_path!(
    bot: nightcrawler,
    start_node: nightcrawler_pressure,
    x: base_x + 660,
    y: 6700,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
    ] + safety_conditions,
    action_type: 'add',
    value: 14
  )
end

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_fallback,
  x: 4620,
  y: 6700,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_fallback,
  x: 4880,
  y: 6700,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_fallback,
  x: 5140,
  y: 6700,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: nightcrawler,
  start_node: nightcrawler_fallback,
  x: 5400,
  y: 6700,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

nightcrawler.compile_program!

beast = user.bots.find_or_initialize_by(name: 'Beast')
beast.description = 'A squeeze bot that values restriction, support, and simplification, trying to win by making the opponent smaller before going for the kill.'
beast.save!

reset_bot_graph!(beast)

beast_root = beast.root_node

beast_terminal = create_organizer!(bot: beast, position_x: 120, position_y: 9000, title: 'Terminal')
beast_opening = create_organizer!(bot: beast, position_x: 860, position_y: 9000, title: 'Opening')
beast_squeeze = create_organizer!(bot: beast, position_x: 1700, position_y: 9000, title: 'Squeeze')
beast_endgame = create_organizer!(bot: beast, position_x: 3280, position_y: 9000, title: 'Endgame')
beast_fallback = create_organizer!(bot: beast, position_x: 4480, position_y: 9000, title: 'Fallback')

[beast_terminal, beast_opening, beast_squeeze, beast_endgame, beast_fallback].each do |organizer|
  connect!(beast_root, organizer)
end

create_path!(
  bot: beast,
  start_node: beast_terminal,
  x: 80,
  y: 9160,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: beast,
  start_node: beast_terminal,
  x: 340,
  y: 9160,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_path!(
  bot: beast,
  start_node: beast_opening,
  x: 760,
  y: 9160,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 12
)

create_path!(
  bot: beast,
  start_node: beast_opening,
  x: 1020,
  y: 9160,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 10
)

create_path!(
  bot: beast,
  start_node: beast_opening,
  x: 1280,
  y: 9160,
  zigzag_offset: 70,
  conditions: opening_game_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 10
)

beast_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

beast_safety.each_with_index do |safety_conditions, index|
  base_x = 1600 + (index * 320)

  create_path!(
    bot: beast,
    start_node: beast_squeeze,
    x: base_x,
    y: 9160,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
    ] + safety_conditions,
    action_type: 'return',
    value: 24
  )

  create_path!(
    bot: beast,
    start_node: beast_squeeze,
    x: base_x + 660,
    y: 9160,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ] + safety_conditions,
    action_type: 'add',
    value: 12
  )

  create_path!(
    bot: beast,
    start_node: beast_squeeze,
    x: base_x + 1320,
    y: 9160,
    zigzag_offset: 70,
    conditions: [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ] + safety_conditions,
    action_type: 'add',
    value: 12
  )
end

create_path!(
  bot: beast,
  start_node: beast_squeeze,
  x: 3580,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 106
)

create_path!(
  bot: beast,
  start_node: beast_squeeze,
  x: 3840,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: beast,
  start_node: beast_endgame,
  x: 3180,
  y: 9160,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: beast,
  start_node: beast_endgame,
  x: 3440,
  y: 9160,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

beast_safety.each_with_index do |safety_conditions, index|
  base_x = 3700 + (index * 320)

  create_path!(
    bot: beast,
    start_node: beast_endgame,
    x: base_x,
    y: 9160,
    zigzag_offset: 70,
    conditions: endgame_gate_conditions + [
      cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
    ] + safety_conditions,
    action_type: 'return',
    value: 30
  )
end

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 4380,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 4640,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 4900,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 5160,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 5420,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 5680,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 5940,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: beast,
  start_node: beast_fallback,
  x: 6200,
  y: 9160,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

beast.compile_program!

colossus = user.bots.find_or_initialize_by(name: 'Colossus')
colossus.description = 'A Cyclops derivative built to convert more advantages by rewarding supported constriction and punishing repetitive non-capturing checks that do not shrink the king box.'
colossus.save!

clone_bot_graph!(source_bot: cyclops, target_bot: colossus)

colossus_root = colossus.root_node
colossus_conversion = create_organizer!(bot: colossus, position_x: 11040, position_y: 4040, title: 'Colossus Conversion')
colossus_discipline = create_organizer!(bot: colossus, position_x: 11620, position_y: 4040, title: 'Colossus Discipline')

connect!(colossus_root, colossus_conversion)
connect!(colossus_root, colossus_discipline)

colossus_conversion_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

colossus_support_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

colossus_support_pressure_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

colossus_conversion_safety.each_with_index do |safety_conditions, index|
  base_x = 10920 + (index * 320)

  create_path!(
    bot: colossus,
    start_node: colossus_conversion,
    x: base_x,
    y: 4200,
    zigzag_offset: 70,
    conditions: colossus_support_box_core + safety_conditions,
    action_type: 'return',
    value: 26
  )

  create_path!(
    bot: colossus,
    start_node: colossus_conversion,
    x: base_x + 660,
    y: 4200,
    zigzag_offset: 70,
    conditions: colossus_support_pressure_core + safety_conditions,
    action_type: 'return',
    value: 26
  )

  create_path!(
    bot: colossus,
    start_node: colossus_conversion,
    x: base_x + 1320,
    y: 4200,
    zigzag_offset: 70,
    conditions: endgame_gate_conditions + colossus_support_box_core + safety_conditions,
    action_type: 'return',
    value: 40
  )
end

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 11500,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 16
)

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 11760,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 14
)

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 12020,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 14
)

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 12280,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 12540,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: colossus,
  start_node: colossus_discipline,
  x: 12800,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

colossus.compile_program!

puts "Seeded #{seed_bots.length + 9} heuristic bots for #{seed_email}"
