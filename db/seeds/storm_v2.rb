# Standalone seed file for Storm v2.

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

def create_shared_path!(bot:, start_node:, x:, y:, shared_conditions:, action_type:, value:, step_y: 150, zigzag_offset: 0)
  create_path!(
    bot: bot,
    start_node: start_node,
    x: x,
    y: y,
    conditions: shared_conditions,
    action_type: action_type,
    value: value,
    step_y: step_y,
    zigzag_offset: zigzag_offset
  )
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

storm_v2 = user.bots.find_or_initialize_by(name: 'Storm v2')
storm_v2.description = 'A behavior-preserving refactor target for Storm using shared graph trunks for the repeated opening, queen, endgame, and fallback families.'
storm_v2.save!

reset_bot_graph!(storm_v2)

storm_root = storm_v2.root_node

storm_terminal = create_organizer!(bot: storm_v2, position_x: 120, position_y: 120, title: 'Terminal')
storm_opening = create_organizer!(bot: storm_v2, position_x: 820, position_y: 120, title: 'Opening')
storm_tactics = create_organizer!(bot: storm_v2, position_x: 560, position_y: 1780, title: 'Tactics')
storm_queen = create_organizer!(bot: storm_v2, position_x: 1960, position_y: 220, title: 'Queen Strategy')
storm_pressure = create_organizer!(bot: storm_v2, position_x: 2200, position_y: 1320, title: 'King Pressure')
storm_endgame = create_organizer!(bot: storm_v2, position_x: 3240, position_y: 900, title: 'Endgame')
storm_fallback = create_organizer!(bot: storm_v2, position_x: 4380, position_y: 1280, title: 'Fallback')

[storm_terminal, storm_opening, storm_tactics, storm_queen, storm_pressure, storm_endgame, storm_fallback].each do |organizer|
  connect!(storm_root, organizer)
end

create_path!(
  bot: storm_v2,
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
  bot: storm_v2,
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

storm_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions
)

storm_knight_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 1180,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_knight_opening_base,
  x: 1180,
  y: 2830,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    }
  ]
)

storm_bishop_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 1780,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_bishop_opening_base,
  x: 1780,
  y: 2830,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    }
  ]
)

storm_pawn_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 2380,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

storm_pawn_bishop_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_pawn_opening_base,
  x: 2380,
  y: 2530,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_pawn_bishop_opening_base,
  x: 2380,
  y: 2680,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

storm_pawn_knight_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_pawn_opening_base,
  x: 2900,
  y: 2530,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_pawn_knight_opening_base,
  x: 2900,
  y: 2680,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_tactics,
  x: 420,
  y: 1940,
  zigzag_offset: 60,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 110
    },
    {
      conditions: [],
      action_type: 'return',
      value: 100
    }
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_tactics,
  x: 940,
  y: 1940,
  zigzag_offset: 60,
  branch_spacing: 240,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 55
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 55
    }
  ]
)

create_path!(
  bot: storm_v2,
  start_node: storm_tactics,
  x: 680,
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
  bot: storm_v2,
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

storm_queen_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

storm_queen_base_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  conditions: storm_queen_base
)

storm_queen_safety_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 1820,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_safety_base,
  x: 1820,
  y: 680,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    }
  ]
)

storm_queen_coordination_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 2600,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_coordination_base,
  x: 2600,
  y: 680,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 3900,
  y: 530,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'return',
      value: -120
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: -120
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 12
    }
  ]
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
  base_x = 2100 + (index * 900)

  create_shared_split_paths!(
    bot: storm_v2,
    start_node: storm_pressure,
    x: base_x,
    y: 1480,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: storm_tighten_core,
        action_type: 'return',
        value: 24
      },
      {
        conditions: storm_strip_core,
        action_type: 'return',
        value: 20
      }
    ]
  )
end

storm_endgame_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame,
  x: 3120,
  y: 1060,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions
)

storm_endgame_capture_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 3120,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_capture_base,
  x: 3120,
  y: 1510,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 88
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 88
    }
  ]
)

storm_endgame_pawn_move_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 3640,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_pawn_move_base,
  x: 3640,
  y: 1510,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'return',
      value: 22
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 22
    }
  ]
)

storm_endgame_pawn_defended_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 4160,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_pawn_defended_base,
  x: 4160,
  y: 1510,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    }
  ]
)

storm_endgame_attacked_less_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 4680,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_attacked_less_base,
  x: 4680,
  y: 1510,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

storm_queen_exclude_mobility_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 4260,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

storm_queen_exclude_mobility_defended_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_node,
  x: 4260,
  y: 1740,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

storm_supported_activity_safe_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 4260,
  y: 1890,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_supported_activity_safe_node,
  x: 4260,
  y: 2040,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 7
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 7
    }
  ]
)

create_shared_path!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 4780,
  y: 1890,
  zigzag_offset: 70,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'rook', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_shared_path!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 5040,
  y: 1440,
  zigzag_offset: 70,
  shared_conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1)
  ],
  action_type: 'add',
  value: 5
)

storm_king_count_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 5300,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: storm_v2,
  start_node: storm_king_count_node,
  x: 5300,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: storm_v2,
  start_node: storm_king_count_node,
  x: 7120,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

storm_pawn_count_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 5560,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: storm_v2,
  start_node: storm_pawn_count_node,
  x: 5560,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

create_path!(
  bot: storm_v2,
  start_node: storm_pawn_count_node,
  x: 5820,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 18
)

storm_fallback_pawn_defended_variants = [
  {
    conditions: [
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  },
  {
    conditions: [
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  }
]

[
  {
    start_node: storm_king_count_node,
    x: 6080,
    y: 1440
  },
  {
    start_node: storm_pawn_count_node,
    x: 6080,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: storm_v2,
    start_node: entry[:start_node],
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    variants: storm_fallback_pawn_defended_variants
  )
end

storm_fallback_attacked_less_variants = [
  {
    conditions: [
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 6
  },
  {
    conditions: [
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 6
  }
]

[
  {
    start_node: storm_king_count_node,
    x: 6600,
    y: 1440
  },
  {
    start_node: storm_pawn_count_node,
    x: 6600,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: storm_v2,
    start_node: entry[:start_node],
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    variants: storm_fallback_attacked_less_variants
  )
end

storm_v2.compile_program!
