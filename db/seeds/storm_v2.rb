# Standalone seed file for Storm v2.

require_relative 'helpers'

user = seed_user!

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
