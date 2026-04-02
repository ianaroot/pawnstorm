# Standalone seed file for Wolverine v2.

require_relative 'helpers'

user = seed_user!

wolverine_v2 = user.bots.find_or_initialize_by(name: 'Wolverine v2')
wolverine_v2.description = 'A fresh tactical bot focused on king-entry safety, forcing pressure, and decisive conversion once the opposing king loosens.'
wolverine_v2.save!

reset_bot_graph!(wolverine_v2)

wolverine_root = wolverine_v2.root_node

wolverine_terminal = create_organizer!(bot: wolverine_v2, position_x: 120, position_y: 120, title: 'Terminal')
wolverine_opening = create_organizer!(bot: wolverine_v2, position_x: 900, position_y: 120, title: 'Opening')
wolverine_tactics = create_organizer!(bot: wolverine_v2, position_x: 600, position_y: 1640, title: 'Tactics')
wolverine_pressure = create_organizer!(bot: wolverine_v2, position_x: 2080, position_y: 980, title: 'King Pressure')
wolverine_endgame = create_organizer!(bot: wolverine_v2, position_x: 3400, position_y: 760, title: 'Endgame')
wolverine_fallback = create_organizer!(bot: wolverine_v2, position_x: 4700, position_y: 980, title: 'Fallback')

[wolverine_terminal, wolverine_opening, wolverine_tactics, wolverine_pressure, wolverine_endgame, wolverine_fallback].each do |organizer|
  connect!(wolverine_root, organizer)
end

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_terminal,
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
  bot: wolverine_v2,
  start_node: wolverine_terminal,
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

wolverine_opening_base = create_condition_chain!(
  bot: wolverine_v2,
  start_node: wolverine_opening,
  x: 760,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions
)

wolverine_knight_opening_base = create_condition_chain!(
  bot: wolverine_v2,
  start_node: wolverine_opening_base,
  x: 1160,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_knight_opening_base,
  x: 1160,
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
      value: 13
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 13
    }
  ]
)

wolverine_bishop_opening_base = create_condition_chain!(
  bot: wolverine_v2,
  start_node: wolverine_opening_base,
  x: 1720,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_bishop_opening_base,
  x: 1720,
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

wolverine_pawn_opening_base = create_condition_chain!(
  bot: wolverine_v2,
  start_node: wolverine_opening_base,
  x: 2280,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_pawn_opening_base,
  x: 2280,
  y: 2530,
  zigzag_offset: 80,
  branch_spacing: 360,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_tactics,
  x: 420,
  y: 1800,
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
  bot: wolverine_v2,
  start_node: wolverine_tactics,
  x: 900,
  y: 1800,
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
      value: 58
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 58
    }
  ]
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_tactics,
  x: 1380,
  y: 1800,
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

wolverine_strike_safety_sets = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'king', comparison: 'greater_than', comparison_value: 0)
  ]
]

wolverine_strike_safety_sets.each_with_index do |safety_conditions, index|
  base_x = 1840 + (index * 720)

  create_shared_split_paths!(
    bot: wolverine_v2,
    start_node: wolverine_tactics,
    x: base_x,
    y: 1800,
    zigzag_offset: 60,
    branch_spacing: 320,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 42
      },
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
          cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
        ],
        action_type: 'return',
        value: 36
      },
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
          cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
        ],
        action_type: 'return',
        value: 34
      }
    ]
  )
end

wolverine_pressure_safety_sets = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

wolverine_pressure_safety_sets.each_with_index do |safety_conditions, index|
  base_x = 1960 + (index * 920)

  pressure_trunk = create_condition_chain!(
    bot: wolverine_v2,
    start_node: wolverine_pressure,
    x: base_x,
    y: 1140,
    zigzag_offset: 70,
    conditions: safety_conditions
  )

  create_shared_split_paths!(
    bot: wolverine_v2,
    start_node: pressure_trunk,
    x: base_x,
    y: 1140 + (safety_conditions.length * 150),
    zigzag_offset: 70,
    branch_spacing: 520,
    shared_conditions: [
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    variants: [
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 34
      },
      {
        conditions: [
          cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
        ],
        action_type: 'add',
        value: 18
      },
      {
        conditions: [],
        action_type: 'add',
        value: 12
      }
    ]
  )
end

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_pressure,
  x: 3000,
  y: 1140,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 32
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_pressure,
  x: 3340,
  y: 1140,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 30
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_endgame,
  x: 3260,
  y: 920,
  zigzag_offset: 70,
  branch_spacing: 540,
  shared_conditions: endgame_gate_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [],
      action_type: 'return',
      value: 30
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 26
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 18
    }
  ]
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_fallback,
  x: 4620,
  y: 1140,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'defender', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_fallback,
  x: 4940,
  y: 1140,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'defender', comparison: 'less_than', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 8
)

create_shared_split_paths!(
  bot: wolverine_v2,
  start_node: wolverine_fallback,
  x: 5580,
  y: 1140,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'defender', comparison: 'greater_than', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: -90
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: -90
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: -120
    }
  ]
)

wolverine_queen_fallback_base = create_condition_chain!(
  bot: wolverine_v2,
  start_node: wolverine_fallback,
  x: 6220,
  y: 1140,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_queen_fallback_base,
  x: 6140,
  y: 1290,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

create_path!(
  bot: wolverine_v2,
  start_node: wolverine_queen_fallback_base,
  x: 6460,
  y: 1290,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

wolverine_v2.compile_program!
