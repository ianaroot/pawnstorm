# Standalone seed file for Beast v2.

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

def create_shared_split_paths!(bot:, start_node:, x:, y:, shared_conditions:, variants:, step_y: 150, zigzag_offset: 0, branch_spacing: 260)
  previous_node = start_node

  shared_conditions.each_with_index do |condition_data, index|
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

  shared_depth = shared_conditions.length

  variants.each_with_index do |variant, variant_index|
    variant_start_x = x + (variant_index * branch_spacing)
    variant_previous_node = previous_node

    variant.fetch(:conditions).each_with_index do |condition_data, index|
      node_x =
        if zigzag_offset.zero?
          variant_start_x
        else
          variant_start_x + (((shared_depth + index) % 2 == 1) ? zigzag_offset : 0)
        end

      condition = create_condition!(
        bot: bot,
        position_x: node_x,
        position_y: y + ((shared_depth + index) * step_y),
        data: condition_data
      )
      connect!(variant_previous_node, condition)
      variant_previous_node = condition
    end

    action_x =
      if zigzag_offset.zero?
        variant_start_x
      else
        total_depth = shared_depth + variant.fetch(:conditions).length
        variant_start_x + ((total_depth % 2 == 1) ? zigzag_offset : 0)
      end

    action_node = create_action!(
      bot: bot,
      position_x: action_x,
      position_y: y + ((shared_depth + variant.fetch(:conditions).length) * step_y),
      action_type: variant.fetch(:action_type),
      value: variant.fetch(:value)
    )
    connect!(variant_previous_node, action_node)
  end
end

def create_condition_chain!(bot:, start_node:, x:, y:, conditions:, step_y: 150, zigzag_offset: 0)
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

  previous_node
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

beast_v2 = user.bots.find_or_initialize_by(name: 'Beast v2')
beast_v2.description = 'A behavior-preserving refactor target for Beast using shared graph trunks instead of repeated flat seed paths.'
beast_v2.save!

reset_bot_graph!(beast_v2)

beast_root = beast_v2.root_node

beast_terminal = create_organizer!(bot: beast_v2, position_x: 120, position_y: 120, title: 'Terminal')
beast_opening = create_organizer!(bot: beast_v2, position_x: 860, position_y: 120, title: 'Opening')
beast_squeeze = create_organizer!(bot: beast_v2, position_x: 1900, position_y: 120, title: 'Squeeze')
beast_endgame = create_organizer!(bot: beast_v2, position_x: 3520, position_y: 120, title: 'Endgame')
beast_fallback = create_organizer!(bot: beast_v2, position_x: 5020, position_y: 120, title: 'Fallback')

[beast_terminal, beast_opening, beast_squeeze, beast_endgame, beast_fallback].each do |organizer|
  connect!(beast_root, organizer)
end

create_path!(
  bot: beast_v2,
  start_node: beast_terminal,
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
  bot: beast_v2,
  start_node: beast_terminal,
  x: 340,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_shared_split_paths!(
  bot: beast_v2,
  start_node: beast_opening,
  x: 760,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 300,
  shared_conditions: opening_game_conditions,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 10
    }
  ]
)

beast_safety_variants = [
  {
    conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
    action_type: 'return',
    value: 24
  },
  {
    conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
    action_type: 'return',
    value: 24
  }
]

beast_squeeze_base = create_condition_chain!(
  bot: beast_v2,
  start_node: beast_squeeze,
  x: 1600,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

[
  {
    x: 1400,
    conditions: [cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')],
    variants: [
      {
        conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
        action_type: 'return',
        value: 24
      },
      {
        conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
        action_type: 'return',
        value: 24
      }
    ]
  },
  {
    x: 2200,
    conditions: [cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')],
    variants: [
      {
        conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
        action_type: 'add',
        value: 12
      },
      {
        conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
        action_type: 'add',
        value: 12
      }
    ]
  },
  {
    x: 3000,
    conditions: [cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')],
    variants: [
      {
        conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
        action_type: 'add',
        value: 12
      },
      {
        conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
        action_type: 'add',
        value: 12
      }
    ]
  }
].each do |family|
  create_shared_split_paths!(
    bot: beast_v2,
    start_node: beast_squeeze_base,
    x: family.fetch(:x),
    y: 580,
    zigzag_offset: 70,
    branch_spacing: 280,
    shared_conditions: family.fetch(:conditions),
    variants: family.fetch(:variants)
  )
end

create_path!(
  bot: beast_v2,
  start_node: beast_squeeze,
  x: 3960,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 106
)

create_path!(
  bot: beast_v2,
  start_node: beast_squeeze,
  x: 4260,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 14
)

beast_endgame_base = create_condition_chain!(
  bot: beast_v2,
  start_node: beast_endgame,
  x: 3420,
  y: 280,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions
)

create_path!(
  bot: beast_v2,
  start_node: beast_endgame_base,
  x: 3240,
  y: 580,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: beast_v2,
  start_node: beast_endgame_base,
  x: 3540,
  y: 580,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

beast_endgame_pressure = create_condition_chain!(
  bot: beast_v2,
  start_node: beast_endgame_base,
  x: 3860,
  y: 580,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: beast_v2,
  start_node: beast_endgame_pressure,
  x: 3760,
  y: 1030,
  zigzag_offset: 70,
  branch_spacing: 280,
  shared_conditions: [],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 30
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'return',
      value: 30
    }
  ]
)

create_path!(
  bot: beast_v2,
  start_node: beast_fallback,
  x: 4920,
  y: 280,
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
  bot: beast_v2,
  start_node: beast_fallback,
  x: 5220,
  y: 280,
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
  bot: beast_v2,
  start_node: beast_fallback,
  x: 5520,
  y: 280,
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
  bot: beast_v2,
  start_node: beast_fallback,
  x: 5820,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: beast_v2,
  start_node: beast_fallback,
  x: 6120,
  y: 280,
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

beast_bishop_fallback = create_condition_chain!(
  bot: beast_v2,
  start_node: beast_fallback,
  x: 6420,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: beast_v2,
  start_node: beast_bishop_fallback,
  x: 6340,
  y: 430,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 8
)

create_path!(
  bot: beast_v2,
  start_node: beast_bishop_fallback,
  x: 6640,
  y: 430,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

create_path!(
  bot: beast_v2,
  start_node: beast_fallback,
  x: 6940,
  y: 280,
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

beast_v2.compile_program!
