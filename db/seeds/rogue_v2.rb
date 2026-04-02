# Standalone seed file for Rogue v2.

require_relative 'helpers'

user = seed_user!

rogue_v2 = user.bots.find_or_initialize_by(name: 'Rogue v2')
rogue_v2.description = 'A behavior-preserving refactor target for Rogue using shared graph trunks instead of repeated flat seed paths.'
rogue_v2.save!

reset_bot_graph!(rogue_v2)

rogue_root = rogue_v2.root_node

rogue_terminal = create_organizer!(bot: rogue_v2, position_x: 120, position_y: 120, title: 'Terminal')
rogue_opening = create_organizer!(bot: rogue_v2, position_x: 820, position_y: 120, title: 'Opening')
rogue_tactics = create_organizer!(bot: rogue_v2, position_x: 560, position_y: 1780, title: 'Tactics')
rogue_queen = create_organizer!(bot: rogue_v2, position_x: 1960, position_y: 220, title: 'Queen Strategy')
rogue_pressure = create_organizer!(bot: rogue_v2, position_x: 2200, position_y: 1320, title: 'King Pressure')
rogue_endgame = create_organizer!(bot: rogue_v2, position_x: 3360, position_y: 900, title: 'Endgame')
rogue_fallback = create_organizer!(bot: rogue_v2, position_x: 4580, position_y: 1280, title: 'Fallback')

[rogue_terminal, rogue_opening, rogue_tactics, rogue_queen, rogue_pressure, rogue_endgame, rogue_fallback].each do |organizer|
  connect!(rogue_root, organizer)
end

create_path!(
  bot: rogue_v2,
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
  bot: rogue_v2,
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

rogue_opening_base = opening_game_conditions

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  branch_spacing: 480,
  shared_conditions: rogue_opening_base,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_tactics,
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

create_path!(
  bot: rogue_v2,
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

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_tactics,
  x: 1200,
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
  bot: rogue_v2,
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

rogue_tactical_strike_targets = [
  {
    x: 1960,
    y: 1940,
    value: 48,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 2480,
    y: 1940,
    value: 40,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 3000,
    y: 1940,
    value: 34,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 3520,
    y: 1940,
    value: 34,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielded', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 3000,
    y: 2510,
    value: 28,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 3520,
    y: 2510,
    value: 26,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  },
  {
    x: 4040,
    y: 2510,
    value: 26,
    target_conditions: [
      cond(subject: 'opponents', subject_specifier: 'rook', relation: 'shielded', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ]
  }
]

rogue_tactical_strike_targets.each do |target|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_tactics,
    x: target[:x],
    y: target[:y],
    zigzag_offset: 60,
    branch_spacing: 260,
    shared_conditions: target[:target_conditions],
    variants: rogue_tactical_strike_safety.map do |safety_conditions|
      {
        conditions: safety_conditions,
        action_type: 'return',
        value: target[:value]
      }
    end
  )
end

rogue_queen_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: rogue_queen_base,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
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

rogue_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

rogue_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

rogue_drive_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
]

rogue_forcing_core = [
  cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
]

rogue_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 2100 + (index * 900)
  safety_trunk = create_condition_chain!(
    bot: rogue_v2,
    start_node: rogue_pressure,
    x: base_x,
    y: 1480,
    conditions: safety_conditions,
    zigzag_offset: 70
  )

  mobility_trunk = create_condition_chain!(
    bot: rogue_v2,
    start_node: safety_trunk,
    x: base_x,
    y: 1480 + (safety_conditions.length * 150),
    conditions: rogue_drive_core,
    zigzag_offset: 70
  )

  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: mobility_trunk,
    x: base_x,
    y: 1480 + ((safety_conditions.length + rogue_drive_core.length) * 150),
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: [],
    variants: [
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 34
      },
      {
        conditions: [],
        action_type: 'add',
        value: 12
      }
    ]
  )

  create_shared_path!(
    bot: rogue_v2,
    start_node: safety_trunk,
    x: base_x + 420,
    y: 1480 + (safety_conditions.length * 150),
    zigzag_offset: 70,
    shared_conditions: rogue_forcing_core,
    action_type: 'add',
    value: 16
  )
end

rogue_shelter_break_adjacent = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_pressure,
  x: 2940,
  y: 2620,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

rogue_shelter_break_shielder_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_shelter_break_adjacent,
  x: 2940,
  y: 2770,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  zigzag_offset: 70
)

rogue_shelter_break_coverer_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_shelter_break_adjacent,
  x: 2940,
  y: 3340,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  zigzag_offset: 70
)

rogue_tactical_strike_safety.each_with_index do |safety_conditions, index|
  base_x = 3180 + (index * 240)

  create_shared_path!(
    bot: rogue_v2,
    start_node: rogue_shelter_break_shielder_start,
    x: base_x,
    y: 3070,
    zigzag_offset: 70,
    shared_conditions: safety_conditions,
    action_type: 'return',
    value: 32
  )

  create_shared_path!(
    bot: rogue_v2,
    start_node: rogue_shelter_break_coverer_start,
    x: base_x,
    y: 3640,
    zigzag_offset: 70,
    shared_conditions: safety_conditions,
    action_type: 'return',
    value: 32
  )
end

rogue_endgame_base = endgame_gate_conditions

rogue_endgame_variants = [
  {
    conditions: [
      cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'return',
    value: 88
  },
  {
    conditions: [
      cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'return',
    value: 88
  },
  {
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: 22
  },
  {
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'return',
    value: 22
  },
  {
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 14
  },
  {
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 14
  },
  {
    conditions: rogue_tighten_core + rogue_pressure_safety[0],
    action_type: 'return',
    value: 32
  },
  {
    conditions: rogue_tighten_core + rogue_pressure_safety[1],
    action_type: 'return',
    value: 32
  },
  {
    conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  },
  {
    conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  }
]

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_endgame,
  x: 3240,
  y: 1060,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: rogue_endgame_base,
  variants: rogue_endgame_variants
)

rogue_fallback_supported_activity_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 4460,
  y: 1440,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_fallback_supported_activity_start,
  x: 4460,
  y: 1740,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
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
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 7
    }
  ]
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_fallback_supported_activity_start,
  x: 5240,
  y: 1740,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: rogue_v2,
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

rogue_fallback_pawn_return_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 5760,
  y: 1440,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  zigzag_offset: 70
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_fallback_pawn_return_start,
  x: 5760,
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
  bot: rogue_v2,
  start_node: rogue_fallback_pawn_return_start,
  x: 6020,
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

rogue_fallback_pawn_defended_variants = [
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

rogue_fallback_pawn_defended_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 6280,
  y: 1440,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

[
  {
    piece_type: 'king',
    x: 6280,
    y: 1590
  },
  {
    piece_type: 'pawn',
    x: 6800,
    y: 2160
  }
].each do |entry|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_fallback_pawn_defended_start,
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'moved_piece', subject_specifier: entry[:piece_type], relation: 'count', comparison: 'greater_than', comparison_value: 0)
    ],
    variants: rogue_fallback_pawn_defended_variants
  )
end

rogue_fallback_attacked_less_variants = [
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

rogue_fallback_attacked_less_start = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 6800,
  y: 1440,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

[
  {
    piece_type: 'king',
    x: 6800,
    y: 1590
  },
  {
    piece_type: 'pawn',
    x: 7320,
    y: 2160
  }
].each do |entry|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_fallback_attacked_less_start,
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'moved_piece', subject_specifier: entry[:piece_type], relation: 'count', comparison: 'greater_than', comparison_value: 0)
    ],
    variants: rogue_fallback_attacked_less_variants
  )
end

create_path!(
  bot: rogue_v2,
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

[
  {
    piece_type: 'knight',
    x: 7320
  },
  {
    piece_type: 'bishop',
    x: 7580
  }
].each do |entry|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_fallback,
    x: entry[:x],
    y: 1440,
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'moved_piece', subject_specifier: entry[:piece_type], relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
    ],
    variants: [
      {
        conditions: [],
        action_type: 'subtract',
        value: 6
      },
      {
        conditions: [
          cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state')
        ],
        action_type: 'subtract',
        value: 8
      },
      {
        conditions: [
          cond(subject: 'moved_piece', relation: 'defender', comparison: 'less_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'subtract',
        value: 8
      }
    ]
  )
end

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 8880,
  y: 1440,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 18
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'queen', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'queen', relation: 'covered', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'bishop', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'rook', relation: 'covered', relation_specifier: 'knight', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 8
    }
  ]
)

rogue_v2_position_overrides = [
  [-1352.0, 148.0],
  [7192.0, -872.0],
  [-3212.0, 1124.0],
  [3704.0, -228.0],
  [432.0, 1308.0],
  [4216.0, 984.0],
  [3740.0, 2632.0],
  [-1392.0, 308.0],
  [-1332.0, 458.0],
  [-1392.0, 608.0],
  [-1172.0, 308.0],
  [-1112.0, 458.0],
  [-1172.0, 608.0],
  [7072.0, -712.0],
  [7152.0, -562.0],
  [7072.0, -412.0],
  [7152.0, -262.0],
  [7072.0, -112.0],
  [7152.0, 38.0],
  [7072.0, 188.0],
  [7152.0, 338.0],
  [7072.0, 488.0],
  [7152.0, 638.0],
  [7072.0, 788.0],
  [7152.0, 938.0],
  [7072.0, 1088.0],
  [7152.0, 1238.0],
  [5896.0, 1464.0],
  [5976.0, 1614.0],
  [5896.0, 1764.0],
  [5976.0, 1914.0],
  [5976.0, 2128.0],
  [6212.0, 1560.0],
  [6292.0, 1710.0],
  [6212.0, 1860.0],
  [6292.0, 2010.0],
  [6292.0, 2224.0],
  [6604.0, 1556.0],
  [6684.0, 1706.0],
  [6604.0, 1856.0],
  [6684.0, 2006.0],
  [6684.0, 2220.0],
  [6996.0, 1560.0],
  [7076.0, 1710.0],
  [6996.0, 1860.0],
  [7076.0, 2010.0],
  [7076.0, 2224.0],
  [7316.0, 1672.0],
  [7396.0, 1822.0],
  [7316.0, 1972.0],
  [7300.0, 2170.0],
  [7668.0, 1632.0],
  [7748.0, 1782.0],
  [7668.0, 1932.0],
  [7652.0, 2130.0],
  [7988.0, 1568.0],
  [8068.0, 1718.0],
  [7988.0, 1868.0],
  [7972.0, 2066.0],
  [8328.0, 1532.0],
  [8408.0, 1682.0],
  [8328.0, 1832.0],
  [8312.0, 2030.0],
  [-3836.0, 612.0],
  [-3980.0, 758.0],
  [-4040.0, 908.0],
  [-3840.0, 842.0],
  [-3780.0, 2196.0],
  [-3720.0, 2346.0],
  [-3724.0, 2556.0],
  [-3440.0, 2116.0],
  [-3380.0, 2266.0],
  [-3504.0, 2416.0],
  [-3512.0, 2606.0],
  [-3260.0, 2416.0],
  [-3268.0, 2606.0],
  [-2984.0, 2004.0],
  [-2924.0, 2154.0],
  [-2984.0, 2304.0],
  [-2924.0, 2454.0],
  [-2932.0, 2636.0],
  [-2368.0, 2632.0],
  [-3056.0, 3010.0],
  [-3056.0, 3216.0],
  [-2796.0, 3010.0],
  [-2856.0, 3160.0],
  [-2796.0, 3310.0],
  [-2804.0, 3500.0],
  [-2536.0, 3010.0],
  [-2536.0, 3204.0],
  [-2276.0, 3010.0],
  [-2336.0, 3160.0],
  [-2348.0, 3354.0],
  [-2016.0, 3010.0],
  [-2076.0, 3160.0],
  [-2088.0, 3354.0],
  [-1756.0, 3010.0],
  [-1816.0, 3160.0],
  [-1828.0, 3354.0],
  [-1496.0, 3010.0],
  [-1556.0, 3160.0],
  [-1568.0, 3354.0],
  [-756.0, 3108.0],
  [-1420.0, 3442.0],
  [-1416.0, 3628.0],
  [-1160.0, 3442.0],
  [-1220.0, 3592.0],
  [-1160.0, 3742.0],
  [-1168.0, 3924.0],
  [-900.0, 3442.0],
  [-900.0, 3648.0],
  [-640.0, 3442.0],
  [-700.0, 3592.0],
  [-708.0, 3782.0],
  [-380.0, 3442.0],
  [-440.0, 3592.0],
  [-448.0, 3790.0],
  [-120.0, 3442.0],
  [-180.0, 3592.0],
  [-188.0, 3782.0],
  [140.0, 3442.0],
  [80.0, 3592.0],
  [72.0, 3782.0],
  [-1488.0, 1904.0],
  [-1960.0, 2234.0],
  [-1968.0, 2420.0],
  [-1700.0, 2234.0],
  [-1760.0, 2384.0],
  [-1700.0, 2534.0],
  [-1700.0, 2720.0],
  [-1440.0, 2234.0],
  [-1440.0, 2416.0],
  [-1180.0, 2234.0],
  [-1240.0, 2384.0],
  [-1248.0, 2566.0],
  [-920.0, 2234.0],
  [-980.0, 2384.0],
  [-988.0, 2566.0],
  [-660.0, 2234.0],
  [-720.0, 2384.0],
  [-728.0, 2566.0],
  [-400.0, 2234.0],
  [-460.0, 2384.0],
  [-468.0, 2566.0],
  [-1792.0, 1072.0],
  [-2572.0, 1338.0],
  [-2584.0, 1540.0],
  [-2312.0, 1338.0],
  [-2372.0, 1488.0],
  [-2312.0, 1638.0],
  [-2324.0, 1832.0],
  [-2052.0, 1338.0],
  [-2060.0, 1520.0],
  [-1792.0, 1338.0],
  [-1852.0, 1488.0],
  [-1856.0, 1686.0],
  [-1532.0, 1338.0],
  [-1592.0, 1488.0],
  [-1596.0, 1686.0],
  [-1272.0, 1338.0],
  [-1332.0, 1488.0],
  [-1336.0, 1686.0],
  [-1012.0, 1338.0],
  [-1072.0, 1488.0],
  [-1076.0, 1686.0],
  [-4984.0, 958.0],
  [-5696.0, 1284.0],
  [-5712.0, 1474.0],
  [-5436.0, 1284.0],
  [-5496.0, 1434.0],
  [-5436.0, 1584.0],
  [-5448.0, 1774.0],
  [-5176.0, 1284.0],
  [-5184.0, 1490.0],
  [-4916.0, 1284.0],
  [-4976.0, 1434.0],
  [-4996.0, 1612.0],
  [-4656.0, 1284.0],
  [-4716.0, 1434.0],
  [-4736.0, 1612.0],
  [-4396.0, 1284.0],
  [-4456.0, 1434.0],
  [-4476.0, 1612.0],
  [-4136.0, 1284.0],
  [-4196.0, 1434.0],
  [-4216.0, 1612.0],
  [-5052.0, 1974.0],
  [-5764.0, 2260.0],
  [-5776.0, 2454.0],
  [-5504.0, 2260.0],
  [-5564.0, 2410.0],
  [-5504.0, 2560.0],
  [-5508.0, 2746.0],
  [-5244.0, 2260.0],
  [-5248.0, 2458.0],
  [-4984.0, 2260.0],
  [-5044.0, 2410.0],
  [-5052.0, 2596.0],
  [-4724.0, 2260.0],
  [-4784.0, 2410.0],
  [-4792.0, 2596.0],
  [-4464.0, 2260.0],
  [-4524.0, 2410.0],
  [-4532.0, 2596.0],
  [-4204.0, 2260.0],
  [-4264.0, 2410.0],
  [-4272.0, 2596.0],
  [-5008.0, 2846.0],
  [-5640.0, 3128.0],
  [-5648.0, 3326.0],
  [-5380.0, 3128.0],
  [-5440.0, 3278.0],
  [-5380.0, 3428.0],
  [-5388.0, 3622.0],
  [-5120.0, 3128.0],
  [-5132.0, 3318.0],
  [-4860.0, 3128.0],
  [-4920.0, 3278.0],
  [-4920.0, 3464.0],
  [-4600.0, 3128.0],
  [-4660.0, 3278.0],
  [-4660.0, 3464.0],
  [-4340.0, 3128.0],
  [-4400.0, 3278.0],
  [-4400.0, 3464.0],
  [-4080.0, 3128.0],
  [-4140.0, 3278.0],
  [-4140.0, 3464.0],
  [3724.0, -28.0],
  [2734.0, 214.0],
  [2664.0, 364.0],
  [2662.0, 550.0],
  [2994.0, 214.0],
  [2924.0, 364.0],
  [2910.0, 574.0],
  [3254.0, 214.0],
  [3184.0, 364.0],
  [3254.0, 514.0],
  [3260.0, 716.0],
  [3514.0, 214.0],
  [3444.0, 364.0],
  [3446.0, 550.0],
  [3774.0, 214.0],
  [3704.0, 364.0],
  [3774.0, 514.0],
  [3772.0, 704.0],
  [4034.0, 214.0],
  [3964.0, 364.0],
  [4034.0, 514.0],
  [4032.0, 704.0],
  [4294.0, 214.0],
  [4224.0, 364.0],
  [4294.0, 514.0],
  [4292.0, 704.0],
  [4554.0, 214.0],
  [4544.0, 420.0],
  [4814.0, 214.0],
  [4744.0, 364.0],
  [4722.0, 554.0],
  [5074.0, 214.0],
  [5004.0, 364.0],
  [5074.0, 514.0],
  [5064.0, 720.0],
  [28.0, 1416.0],
  [-116.0, 1566.0],
  [-196.0, 1708.0],
  [-202.0, 1894.0],
  [-8.0, 1712.0],
  [160.0, 1550.0],
  [166.0, 1768.0],
  [1416.0, 1272.0],
  [1264.0, 1422.0],
  [1164.0, 1560.0],
  [1154.0, 1766.0],
  [1384.0, 1568.0],
  [1580.0, 1430.0],
  [1586.0, 1696.0],
  [892.0, 1768.0],
  [356.0, 1990.0],
  [354.0, 2200.0],
  [1456.0, 2636.0],
  [1526.0, 2786.0],
  [-280.0, 2470.0],
  [-210.0, 2620.0],
  [848.0, 3120.0],
  [834.0, 3318.0],
  [-40.0, 2470.0],
  [30.0, 2620.0],
  [-40.0, 2770.0],
  [30.0, 2920.0],
  [1088.0, 3120.0],
  [1158.0, 3270.0],
  [1088.0, 3420.0],
  [1090.0, 3622.0],
  [200.0, 2470.0],
  [270.0, 2620.0],
  [1328.0, 3120.0],
  [1330.0, 3326.0],
  [440.0, 2470.0],
  [510.0, 2620.0],
  [440.0, 2770.0],
  [1568.0, 3120.0],
  [1638.0, 3270.0],
  [1624.0, 3456.0],
  [680.0, 2470.0],
  [750.0, 2620.0],
  [680.0, 2770.0],
  [1808.0, 3120.0],
  [1878.0, 3270.0],
  [1864.0, 3456.0],
  [920.0, 2470.0],
  [990.0, 2620.0],
  [920.0, 2770.0],
  [2048.0, 3120.0],
  [2118.0, 3270.0],
  [2104.0, 3456.0],
  [1160.0, 2470.0],
  [1230.0, 2620.0],
  [1160.0, 2770.0],
  [2288.0, 3120.0],
  [2358.0, 3270.0],
  [2344.0, 3456.0],
  [4096.0, 1144.0],
  [4166.0, 1294.0],
  [3168.0, 1448.0],
  [3238.0, 1598.0],
  [3228.0, 1792.0],
  [3396.0, 1628.0],
  [3466.0, 1778.0],
  [3468.0, 1976.0],
  [3656.0, 1628.0],
  [3726.0, 1778.0],
  [3728.0, 1976.0],
  [3916.0, 1628.0],
  [3986.0, 1778.0],
  [3988.0, 1976.0],
  [4176.0, 1628.0],
  [4246.0, 1778.0],
  [4248.0, 1976.0],
  [4436.0, 1628.0],
  [4506.0, 1778.0],
  [4508.0, 1976.0],
  [4696.0, 1628.0],
  [4766.0, 1778.0],
  [4696.0, 1928.0],
  [4686.0, 2122.0],
  [4956.0, 1628.0],
  [5026.0, 1778.0],
  [4956.0, 1928.0],
  [4946.0, 2122.0],
  [5216.0, 1628.0],
  [5286.0, 1778.0],
  [5216.0, 1928.0],
  [5206.0, 2122.0],
  [5476.0, 1628.0],
  [5546.0, 1778.0],
  [5476.0, 1928.0],
  [5466.0, 2122.0],
  [2844.0, 2464.0],
  [2914.0, 2614.0],
  [2732.0, 2744.0],
  [2598.0, 2890.0],
  [2464.0, 3040.0],
  [2458.0, 3246.0],
  [2600.0, 3136.0],
  [2598.0, 3354.0],
  [2752.0, 3040.0],
  [2822.0, 3190.0],
  [2828.0, 3396.0],
  [3068.0, 2764.0],
  [3138.0, 2914.0],
  [3128.0, 3112.0],
  [3036.0, 3444.0],
  [3106.0, 3594.0],
  [3036.0, 3744.0],
  [3106.0, 3894.0],
  [3100.0, 4092.0],
  [3316.0, 3416.0],
  [3316.0, 3566.0],
  [3386.0, 3716.0],
  [3316.0, 3866.0],
  [3302.0, 4048.0],
  [3576.0, 3566.0],
  [3646.0, 3716.0],
  [3576.0, 3866.0],
  [3562.0, 4048.0],
  [3952.0, 3040.0],
  [3852.0, 3190.0],
  [3758.0, 3332.0],
  [3748.0, 3538.0],
  [3962.0, 3340.0],
  [3964.0, 3534.0],
  [4272.0, 3180.0],
  [4138.0, 3314.0],
  [4132.0, 3508.0],
  [4398.0, 3314.0],
  [4392.0, 3508.0],
  [5024.0, 3700.0],
  [4828.0, 3850.0],
  [4690.0, 4004.0],
  [4676.0, 4198.0],
  [4950.0, 4004.0],
  [4936.0, 4198.0],
  [5248.0, 3860.0],
  [5122.0, 4026.0],
  [5112.0, 4232.0],
  [5382.0, 4026.0],
  [5372.0, 4232.0],
  [6084.0, 3740.0],
  [6154.0, 3890.0],
  [6084.0, 4040.0],
  [6154.0, 4190.0],
  [6152.0, 4372.0],
  [5636.0, 3728.0],
  [5706.0, 3878.0],
  [5636.0, 4028.0],
  [5526.0, 4170.0],
  [5638.0, 4234.0],
  [5632.0, 4440.0],
  [5850.0, 4178.0],
  [5848.0, 4372.0],
  [6564.0, 3696.0],
  [6634.0, 3846.0],
  [6564.0, 3996.0],
  [6422.0, 4146.0],
  [6562.0, 4206.0],
  [6556.0, 4392.0],
  [6702.0, 4134.0],
  [6696.0, 4344.0],
  [5308.0, 3004.0],
  [5378.0, 3154.0],
  [5612.0, 2984.0],
  [5682.0, 3134.0],
  [5872.0, 2984.0],
  [5942.0, 3134.0],
  [6132.0, 2984.0],
  [6202.0, 3134.0],
  [6392.0, 2984.0],
  [6462.0, 3134.0],
  [6652.0, 2984.0],
  [6722.0, 3134.0],
  [6912.0, 2984.0],
  [6982.0, 3134.0],
  [6114.0, 2729.0]
]

rogue_v2_created_nodes = rogue_v2.nodes.where.not(node_type: 'root').order(:id).to_a

if rogue_v2_created_nodes.length == rogue_v2_position_overrides.length
  rogue_v2_created_nodes.zip(rogue_v2_position_overrides).each do |node, (position_x, position_y)|
    node.update_columns(position_x: position_x, position_y: position_y)
  end
end

rogue_v2.compile_program!
