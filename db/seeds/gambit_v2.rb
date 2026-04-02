# Standalone seed file for Gambit v2.

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

gambit_v2 = user.bots.find_or_initialize_by(name: 'Gambit v2')
gambit_v2.description = 'A behavior-preserving refactor target for Gambit using shared graph trunks instead of repeated flat seed paths.'
gambit_v2.save!

reset_bot_graph!(gambit_v2)

gambit_root = gambit_v2.root_node

gambit_terminal = create_organizer!(bot: gambit_v2, position_x: 120, position_y: 120, title: 'Terminal')
gambit_opening = create_organizer!(bot: gambit_v2, position_x: 760, position_y: 120, title: 'Opening')
gambit_tactics = create_organizer!(bot: gambit_v2, position_x: 520, position_y: 1820, title: 'Tactics')
gambit_pressure = create_organizer!(bot: gambit_v2, position_x: 2040, position_y: 1180, title: 'King Pressure')
gambit_endgame = create_organizer!(bot: gambit_v2, position_x: 3020, position_y: 880, title: 'Endgame')
gambit_fallback = create_organizer!(bot: gambit_v2, position_x: 4040, position_y: 1360, title: 'Fallback')

[gambit_terminal, gambit_opening, gambit_tactics, gambit_pressure, gambit_endgame, gambit_fallback].each do |organizer|
  connect!(gambit_root, organizer)
end

create_path!(
  bot: gambit_v2,
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
  bot: gambit_v2,
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

opening_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_opening,
  x: 660,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: opening_trunk,
  x: 660,
  y: 2380,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 13
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 13
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: opening_trunk,
  x: 1180,
  y: 2380,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 12
    }
  ]
)

gambit_pawn_chain_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: opening_trunk,
  x: 1700,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', relation_specifier: 'pawn', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ]
)

gambit_pawn_frees_bishop_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_pawn_chain_trunk,
  x: 1700,
  y: 2830,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

queen_attacked_equal_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_pawn_frees_bishop_trunk,
  x: 1700,
  y: 2980,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: queen_attacked_equal_trunk,
  x: 1700,
  y: 3130,
  zigzag_offset: 80,
  branch_spacing: 240,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    }
  ]
)

queen_attacked_less_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_pawn_frees_bishop_trunk,
  x: 2180,
  y: 2980,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: queen_attacked_less_trunk,
  x: 2180,
  y: 3130,
  zigzag_offset: 80,
  branch_spacing: 240,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: gambit_pawn_chain_trunk,
  x: 2740,
  y: 2830,
  zigzag_offset: 80,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 9
    },
    {
      conditions: [cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', comparison: 'greater_than', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 9
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: gambit_tactics,
  x: 420,
  y: 1980,
  zigzag_offset: 60,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'captured_piece', relation: 'value', comparison: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
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
  bot: gambit_v2,
  start_node: gambit_tactics,
  x: 940,
  y: 1980,
  zigzag_offset: 60,
  branch_spacing: 240,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'return',
      value: 60
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 60
    }
  ]
)

create_path!(
  bot: gambit_v2,
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

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: gambit_tactics,
  x: 1700,
  y: 1980,
  zigzag_offset: 60,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 34
    },
    {
      conditions: [cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 34
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: gambit_tactics,
  x: 2220,
  y: 1980,
  zigzag_offset: 60,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'rook', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 28
    },
    {
      conditions: [cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 28
    }
  ]
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
    bot: gambit_v2,
    start_node: gambit_pressure,
    x: base_x,
    y: 1340,
    zigzag_offset: 70,
    conditions: gambit_tighten_core + safety_conditions,
    action_type: 'return',
    value: 30
  )

  create_path!(
    bot: gambit_v2,
    start_node: gambit_pressure,
    x: base_x,
    y: 1910,
    zigzag_offset: 70,
    conditions: gambit_strip_core + safety_conditions,
    action_type: 'return',
    value: 26
  )
end

endgame_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_endgame,
  x: 2900,
  y: 1040,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: endgame_trunk,
  x: 2900,
  y: 1340,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'return',
      value: 90
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 90
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: endgame_trunk,
  x: 3420,
  y: 1340,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 22
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 22
    }
  ]
)

create_path!(
  bot: gambit_v2,
  start_node: endgame_trunk,
  x: 3940,
  y: 1340,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

queen_fallback_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_fallback,
  x: 3940,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

queen_attacker_one_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 4220,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: queen_attacker_one_trunk,
  x: 3940,
  y: 2120,
  zigzag_offset: 70,
  branch_spacing: 280,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', relation_specifier_mode: 'exclude', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_path!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 4500,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 4780,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_path!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 5040,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 6
)

bishop_support_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 5300,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: bishop_support_trunk,
  x: 5300,
  y: 1970,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 6
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 6
    }
  ]
)

knight_support_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: queen_fallback_trunk,
  x: 5820,
  y: 1820,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: knight_support_trunk,
  x: 5820,
  y: 1970,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 6
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 6
    }
  ]
)

pawn_support_trunk = create_condition_chain!(
  bot: gambit_v2,
  start_node: gambit_fallback,
  x: 6340,
  y: 1520,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: pawn_support_trunk,
  x: 6340,
  y: 1670,
  zigzag_offset: 70,
  branch_spacing: 520,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 6
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 6
    }
  ]
)

create_shared_split_paths!(
  bot: gambit_v2,
  start_node: pawn_support_trunk,
  x: 6860,
  y: 1670,
  zigzag_offset: 70,
  branch_spacing: 520,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 6
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 6
    }
  ]
)

create_path!(
  bot: gambit_v2,
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
  bot: gambit_v2,
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
  bot: gambit_v2,
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

gambit_v2.compile_program!
