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

rogue_opening_base_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_opening,
  x: 700,
  y: 280,
  conditions: rogue_opening_base,
  zigzag_offset: 80
)

[
  { piece_type: 'knight', x: 700, value: 12 },
  { piece_type: 'bishop', x: 1180, value: 11 }
].each do |entry|
  opening_development_trunk = create_condition_chain!(
    bot: rogue_v2,
    start_node: rogue_opening_base_trunk,
    x: entry[:x],
    y: 2380,
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: entry[:piece_type], relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', subject_specifier: entry[:piece_type], relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    zigzag_offset: 80
  )

  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: opening_development_trunk,
    x: entry[:x],
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
        value: entry[:value]
      },
      {
        conditions: [
          cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
        ],
        action_type: 'add',
        value: entry[:value]
      }
    ]
  )
end

pawn_opening_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_opening_base_trunk,
  x: 1660,
  y: 2380,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  zigzag_offset: 80
)

[
  { piece_type: 'bishop', relation: 'mobility', x: 1660 },
  { piece_type: 'knight', relation: 'defended', x: 2140 }
].each do |entry|
  opening_support_trunk = create_condition_chain!(
    bot: rogue_v2,
    start_node: pawn_opening_trunk,
    x: entry[:x],
    y: 2530,
    conditions: [
      cond(subject: 'allies', subject_specifier: entry[:piece_type], relation: entry[:relation], comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    zigzag_offset: 80
  )

  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: opening_support_trunk,
    x: entry[:x],
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
end

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

rogue_queen_base_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_queen,
  x: 1820,
  y: 380,
  conditions: rogue_queen_base,
  zigzag_offset: 70
)

rogue_queen_safer_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_queen_base_trunk,
  x: 1820,
  y: 530,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_queen_safer_trunk,
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

rogue_queen_safe_attack_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_queen_base_trunk,
  x: 2340,
  y: 530,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_queen_safe_attack_trunk,
  x: 2340,
  y: 830,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 14
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_queen_safe_attack_trunk,
  x: 2600,
  y: 830,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 14
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_queen_safe_attack_trunk,
  x: 2860,
  y: 830,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
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

create_path!(
  bot: rogue_v2,
  start_node: rogue_queen_base_trunk,
  x: 3640,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_queen_base_trunk,
  x: 3900,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: -120
)

create_path!(
  bot: rogue_v2,
  start_node: rogue_queen_base_trunk,
  x: 4160,
  y: 530,
  zigzag_offset: 70,
  conditions: [
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

rogue_endgame_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame,
  x: 3240,
  y: 1060,
  conditions: rogue_endgame_base,
  zigzag_offset: 70
)

captured_pawn_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame_trunk,
  x: 3240,
  y: 1360,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: captured_pawn_trunk,
  x: 3240,
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

pawn_push_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame_trunk,
  x: 3760,
  y: 1360,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: pawn_push_trunk,
  x: 3760,
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

pawn_defense_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame_trunk,
  x: 4280,
  y: 1360,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: pawn_defense_trunk,
  x: 4280,
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

tighten_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame_trunk,
  x: 4800,
  y: 1360,
  conditions: rogue_tighten_core,
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: tighten_trunk,
  x: 4800,
  y: 1660,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: rogue_pressure_safety[0],
      action_type: 'return',
      value: 32
    },
    {
      conditions: rogue_pressure_safety[1],
      action_type: 'return',
      value: 32
    }
  ]
)

relief_trunk = create_condition_chain!(
  bot: rogue_v2,
  start_node: rogue_endgame_trunk,
  x: 5320,
  y: 1360,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: relief_trunk,
  x: 5320,
  y: 1660,
  zigzag_offset: 70,
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
  [-980.0, -327.3330078125],
  [7255.238115583148, 155.4285714285714],
  [-3914.665367126465, 1600.0],
  [3308.5714285714275, 260.0],
  [532.0, 3328.0],
  [5206.857142857143, 1547.4285714285716],
  [3030.285714285712, 3342.8571428571427],
  [-1020.0, -167.3330078125],
  [-960.0, -17.3330078125],
  [-1020.0, 132.6669921875],
  [-800.0, -167.3330078125],
  [-740.0, -17.3330078125],
  [-800.0, 132.6669921875],
  [7135.238115583148, 315.4285714285714],
  [7215.238115583148, 465.4285714285714],
  [7135.238115583148, 615.4285714285713],
  [7215.238115583148, 765.4285714285713],
  [7135.238115583148, 915.4285714285713],
  [7215.238115583148, 1065.4285714285713],
  [7135.238115583148, 1215.4285714285713],
  [7215.238115583148, 1365.4285714285713],
  [7135.238115583148, 1515.4285714285713],
  [7215.238115583148, 1665.4285714285713],
  [7135.238115583148, 1815.4285714285713],
  [7215.238115583148, 1965.4285714285713],
  [7135.238115583148, 2115.4285714285716],
  [7215.238115583148, 2265.4285714285716],
  [6706.666687011721, 2409.714285714286],
  [6786.666687011721, 2559.714285714286],
  [6706.666687011721, 2709.714285714286],
  [6595.238115583148, 2859.714285714286],
  [6592.380972726005, 3061.1428571428573],
  [6815.238115583148, 2856.8571428571427],
  [6812.380972726005, 3058.285714285714],
  [7206.666687011721, 2489.7142857142853],
  [7286.666687011721, 2639.7142857142853],
  [7206.666687011721, 2789.7142857142853],
  [7080.952401297434, 2933.9999999999995],
  [7078.095258440291, 3135.428571428571],
  [7352.380972726007, 2939.7142857142853],
  [7349.523829868864, 3141.142857142857],
  [7832.380972726006, 2398.2857142857147],
  [7672.380972726006, 2542.571428571429],
  [7538.095258440292, 2684.0000000000005],
  [7535.238115583148, 2874.0000000000005],
  [7780.952401297432, 2689.7142857142862],
  [7778.0952584402885, 2879.7142857142862],
  [8120.9524012974325, 2545.428571428572],
  [7998.0952584402885, 2692.571428571429],
  [7995.238115583145, 2882.571428571429],
  [8263.809544154574, 2681.142857142858],
  [8260.952401297433, 2871.142857142858],
  [-5301.327842712402, 1356.0],
  [-5497.327842712402, 1506.0],
  [-5497.327842712402, 1708.0],
  [-5157.327842712402, 1510.0],
  [-3742.665367126465, 3176.0],
  [-3682.665367126465, 3326.0],
  [-3688.379652840751, 3516.0],
  [-3462.665367126465, 3040.0],
  [-3402.665367126465, 3190.0],
  [-3462.665367126465, 3340.0],
  [-3462.6653671264653, 3530.0],
  [-3222.665367126465, 3340.0],
  [-3222.6653671264653, 3530.0],
  [-2954.665367126465, 3188.0],
  [-2894.665367126465, 3338.0],
  [-2954.665367126465, 3488.0],
  [-2894.665367126465, 3638.0],
  [-2900.3796528407506, 3845.142857142857],
  [-2201.2108216719193, 3874.909090909091],
  [-2725.2108216719193, 4096.909090909091],
  [-2785.2108216719193, 4246.909090909091],
  [-2465.2108216719193, 4096.909090909091],
  [-2525.2108216719193, 4246.909090909091],
  [-2473.2108216719193, 4392.909090909091],
  [-2473.2108216719193, 4590.909090909091],
  [-2205.2108216719193, 4096.909090909091],
  [-2213.2108216719193, 4310.909090909091],
  [-1945.2108216719193, 4096.909090909091],
  [-2005.2108216719193, 4246.909090909091],
  [-2021.2108216719193, 4440.909090909091],
  [-1685.2108216719193, 4096.909090909091],
  [-1745.2108216719193, 4246.909090909091],
  [-1761.2108216719193, 4440.909090909091],
  [-1425.2108216719193, 4096.909090909091],
  [-1485.2108216719193, 4246.909090909091],
  [-1501.2108216719193, 4440.909090909091],
  [-1165.2108216719193, 4096.909090909091],
  [-1225.2108216719193, 4246.909090909091],
  [-1241.2108216719193, 4440.909090909091],
  [-1593.9380943991923, 2876.3636363636365],
  [-2385.9380943991923, 3134.3636363636365],
  [-2389.9380943991923, 3344.3636363636365],
  [-2125.9380943991923, 3134.3636363636365],
  [-2185.9380943991923, 3284.3636363636365],
  [-2125.9380943991923, 3434.3636363636365],
  [-2133.9380943991923, 3628.3636363636365],
  [-1865.9380943991923, 3134.3636363636365],
  [-1865.9380943991923, 3324.3636363636365],
  [-1605.9380943991923, 3134.3636363636365],
  [-1665.9380943991923, 3284.3636363636365],
  [-1669.9380943991923, 3482.3636363636365],
  [-1345.9380943991923, 3134.3636363636365],
  [-1405.9380943991923, 3284.3636363636365],
  [-1409.9380943991923, 3482.3636363636365],
  [-1085.9380943991923, 3134.3636363636365],
  [-1145.9380943991923, 3284.3636363636365],
  [-1149.9380943991923, 3482.3636363636365],
  [-825.9380943991923, 3134.3636363636365],
  [-885.9380943991923, 3284.3636363636365],
  [-889.9380943991923, 3482.3636363636365],
  [-929.5744580355558, 1968.727272727273],
  [-1713.5744580355558, 2137.636363636364],
  [-1413.5744580355558, 2198.727272727273],
  [-1473.5744580355558, 2348.727272727273],
  [-1413.5744580355558, 2498.727272727273],
  [-1425.5744580355558, 2696.727272727273],
  [-1153.5744580355558, 2198.727272727273],
  [-1161.5744580355558, 2412.727272727273],
  [-893.5744580355558, 2198.727272727273],
  [-953.5744580355558, 2348.727272727273],
  [-949.5744580355558, 2546.727272727273],
  [-633.5744580355558, 2198.727272727273],
  [-693.5744580355558, 2348.727272727273],
  [-689.5744580355558, 2546.727272727273],
  [-373.57445803555584, 2198.727272727273],
  [-433.57445803555584, 2348.727272727273],
  [-429.57445803555584, 2546.727272727273],
  [-113.57445803555584, 2198.727272727273],
  [-173.57445803555584, 2348.727272727273],
  [-169.57445803555584, 2546.727272727273],
  [-1458.6653671264648, 1040.0],
  [-2242.665367126465, 1298.0],
  [-1982.6653671264648, 1298.0],
  [-2042.6653671264648, 1448.0],
  [-1982.6653671264648, 1598.0],
  [-1990.6653671264648, 1800.0],
  [-1722.6653671264648, 1298.0],
  [-1730.6653671264648, 1496.0],
  [-1462.6653671264648, 1298.0],
  [-1522.6653671264648, 1448.0],
  [-1526.6653671264648, 1638.0],
  [-1202.6653671264648, 1298.0],
  [-1262.6653671264648, 1448.0],
  [-1266.6653671264648, 1638.0],
  [-942.6653671264648, 1298.0],
  [-1002.6653671264648, 1448.0],
  [-1006.6653671264648, 1638.0],
  [-682.6653671264648, 1298.0],
  [-742.6653671264648, 1448.0],
  [-746.6653671264648, 1638.0],
  [-5412.190705435611, 1940.8571428571431],
  [-6183.737205505356, 2245.1428571428573],
  [-6191.737205505356, 2463.1428571428573],
  [-5923.737205505356, 2245.1428571428573],
  [-5983.737205505356, 2395.1428571428573],
  [-5923.737205505356, 2545.1428571428573],
  [-5926.594348362499, 2743.7142857142862],
  [-5663.737205505356, 2245.1428571428573],
  [-5667.737205505356, 2455.1428571428573],
  [-5403.737205505356, 2245.1428571428573],
  [-5463.737205505356, 2395.1428571428573],
  [-5469.451491219641, 2585.1428571428573],
  [-5143.737205505356, 2245.1428571428573],
  [-5203.737205505356, 2395.1428571428573],
  [-5209.451491219641, 2585.1428571428573],
  [-4883.737205505356, 2245.1428571428573],
  [-4943.737205505356, 2395.1428571428573],
  [-4949.451491219641, 2585.1428571428573],
  [-4623.737205505356, 2245.1428571428573],
  [-4683.737205505356, 2395.1428571428573],
  [-4689.451491219641, 2585.1428571428573],
  [-5261.333824157715, 2910.0],
  [-5989.905252729144, 3177.1428571428573],
  [-5995.61953844343, 3384.285714285714],
  [-5729.905252729144, 3177.1428571428573],
  [-5789.905252729144, 3327.1428571428573],
  [-5729.905252729144, 3477.1428571428573],
  [-5735.61953844343, 3670.0],
  [-5469.905252729143, 3177.1428571428573],
  [-5475.6195384434295, 3370.0],
  [-5209.905252729143, 3177.1428571428573],
  [-5269.905252729143, 3327.1428571428573],
  [-5272.762395586286, 3511.428571428572],
  [-4949.905252729143, 3177.1428571428573],
  [-5009.905252729143, 3327.1428571428573],
  [-5012.762395586286, 3511.428571428572],
  [-4689.905252729143, 3177.1428571428573],
  [-4749.905252729143, 3327.1428571428573],
  [-4752.762395586286, 3511.428571428572],
  [-4429.905252729143, 3177.1428571428573],
  [-4489.905252729143, 3327.1428571428573],
  [-4498.093938555036, 3535.428571428572],
  [-3946.0939385550355, 3559.7142857142853],
  [-4723.236795697892, 3841.142857142857],
  [-4723.236795697892, 4045.4285714285706],
  [-4463.236795697892, 3841.142857142857],
  [-4523.236795697892, 3991.142857142857],
  [-4463.236795697892, 4141.142857142857],
  [-4471.808224269322, 4322.571428571428],
  [-4203.236795697892, 3841.142857142857],
  [-4206.0939385550355, 4048.2857142857138],
  [-3943.2367956978924, 3841.142857142857],
  [-4003.2367956978924, 3991.142857142857],
  [-4008.9510814121786, 4175.428571428571],
  [-3683.2367956978924, 3841.142857142857],
  [-3743.2367956978924, 3991.142857142857],
  [-3748.9510814121786, 4175.428571428571],
  [-3423.236795697893, 3841.142857142857],
  [-3483.2367956978924, 3991.142857142857],
  [-3488.9510814121786, 4175.428571428571],
  [-3163.236795697893, 3841.142857142857],
  [-3223.236795697893, 3991.142857142857],
  [-3228.951081412178, 4175.428571428571],
  [3328.5714285714275, 468.57142857142856],
  [3148.5714285714275, 607.1428571428572],
  [3014.285714285713, 751.4285714285716],
  [3009.999999999999, 955.7142857142858],
  [3262.857142857142, 748.5714285714286],
  [3258.5714285714284, 952.8571428571428],
  [3339.999999999999, 1070.0],
  [3409.999999999999, 1220.0],
  [2891.4285714285706, 1450.0],
  [2895.7142857142844, 1645.7142857142858],
  [3151.4285714285706, 1450.0],
  [3155.7142857142844, 1645.7142857142858],
  [3411.4285714285706, 1450.0],
  [3415.7142857142844, 1645.7142857142858],
  [3671.4285714285706, 1450.0],
  [3675.7142857142844, 1645.7142857142858],
  [3931.4285714285706, 1450.0],
  [3935.7142857142844, 1645.7142857142858],
  [3480.000000000001, 815.7142857142858],
  [3475.714285714287, 1022.8571428571429],
  [3740.000000000001, 815.7142857142858],
  [3810.000000000001, 965.7142857142858],
  [3805.714285714287, 1172.8571428571431],
  [4000.000000000001, 815.7142857142858],
  [4070.000000000001, 965.7142857142858],
  [4000.000000000001, 1115.7142857142858],
  [4001.4285714285716, 1300.0000000000005],
  [-128.0, 3536.0],
  [-296.0, 3670.0],
  [-440.0, 3804.0],
  [-446.0, 4006.0],
  [-168.0, 3816.0],
  [48.0, 3686.0],
  [30.0, 4004.0],
  [1332.0, 3488.0],
  [1112.0, 3622.0],
  [1112.0, 3836.0],
  [1106.0, 4050.0],
  [1256.0, 3772.0],
  [1492.0, 3634.0],
  [1478.0, 3848.0],
  [528.0, 3876.0],
  [0.9523809523798263, 4259.333333333332],
  [-457.80952380952476, 4423.2380952380945],
  [808.0000000000009, 4164.571428571428],
  [878.0000000000009, 4314.571428571428],
  [-907.8095238095252, 4566.190476190475],
  [-910.0000000000018, 4748.190476190475],
  [510.85714285714494, 4461.714285714286],
  [495.1428571428578, 4648.857142857143],
  [-924.5714285714303, 4909.619047619048],
  [-854.5714285714303, 5059.619047619048],
  [-924.5714285714303, 5209.619047619048],
  [-934.5714285714303, 5408.190476190476],
  [656.5714285714303, 4656.0],
  [726.5714285714303, 4806.0],
  [656.5714285714303, 4956.0],
  [655.1428571428587, 5140.285714285714],
  [-720.1904761904775, 4871.142857142857],
  [-724.4761904761917, 5072.5714285714275],
  [896.5714285714303, 4656.0],
  [895.1428571428587, 4846.0],
  [-516.3809523809532, 4833.2380952380945],
  [-446.3809523809532, 4983.2380952380945],
  [-442.09523809523944, 5178.95238095238],
  [1136.5714285714303, 4656.0],
  [1206.5714285714303, 4806.0],
  [1196.5714285714303, 4998.857142857143],
  [-284.95238095238165, 4773.238095238094],
  [-214.95238095238165, 4923.238095238094],
  [-210.66666666666788, 5118.952380952379],
  [1376.5714285714303, 4656.0],
  [1446.5714285714303, 4806.0],
  [1436.5714285714303, 4998.857142857143],
  [-30.66666666666788, 4727.523809523808],
  [39.33333333333212, 4877.523809523808],
  [43.61904761904589, 5073.238095238094],
  [1616.5714285714303, 4656.0],
  [1686.5714285714303, 4806.0],
  [1676.5714285714303, 4998.857142857143],
  [215.04761904761745, 4584.666666666665],
  [285.04761904761745, 4734.666666666665],
  [289.3333333333321, 4930.3809523809505],
  [1856.5714285714303, 4656.0],
  [1926.5714285714303, 4806.0],
  [1916.5714285714303, 4998.857142857143],
  [5086.857142857143, 1707.4285714285716],
  [5156.857142857143, 1857.4285714285716],
  [4104.0, 2087.4285714285716],
  [3989.7142857142862, 2243.1428571428573],
  [3985.4285714285706, 2433.1428571428573],
  [4249.714285714286, 2243.1428571428573],
  [4245.428571428571, 2433.1428571428573],
  [4624.0, 2087.4285714285716],
  [4489.714285714286, 2231.714285714286],
  [4482.5714285714275, 2436.0],
  [4749.714285714286, 2231.714285714286],
  [4742.5714285714275, 2436.0],
  [5144.0, 2087.4285714285716],
  [5009.714285714286, 2231.714285714286],
  [5002.5714285714275, 2436.0],
  [5269.714285714286, 2231.714285714286],
  [5262.5714285714275, 2436.0],
  [5569.714285714284, 2087.4285714285716],
  [5639.714285714284, 2237.4285714285716],
  [5501.142857142853, 2393.142857142857],
  [5502.571428571426, 2580.285714285714],
  [5763.999999999998, 2384.571428571429],
  [5759.714285714283, 2606.0],
  [6015.428571428571, 2090.2857142857147],
  [6085.428571428571, 2240.2857142857147],
  [6015.428571428571, 2390.2857142857147],
  [6011.142857142857, 2571.7142857142853],
  [6275.428571428571, 2390.2857142857147],
  [6271.142857142857, 2571.7142857142853],
  [1901.7142857142835, 3448.5714285714284],
  [1971.7142857142835, 3598.5714285714284],
  [1901.7142857142835, 3748.5714285714284],
  [1971.7142857142835, 3898.5714285714284],
  [1790.285714285712, 4048.5714285714284],
  [1791.7142857142826, 4235.714285714286],
  [1973.1428571428542, 4182.857142857143],
  [1974.5714285714248, 4370.000000000002],
  [2118.8571428571404, 4057.142857142857],
  [2188.8571428571404, 4207.142857142857],
  [2187.428571428568, 4411.428571428571],
  [2293.142857142854, 3751.428571428571],
  [2363.142857142854, 3901.428571428571],
  [2358.8571428571404, 4100.0],
  [2150.285714285712, 4608.571428571429],
  [2220.285714285712, 4758.571428571429],
  [2150.285714285712, 4908.571428571429],
  [2220.285714285712, 5058.571428571429],
  [2224.5714285714257, 5265.714285714286],
  [2407.428571428569, 4525.714285714286],
  [2407.428571428569, 4675.714285714286],
  [2477.428571428569, 4825.714285714286],
  [2407.428571428569, 4975.714285714286],
  [2397.428571428569, 5180.0],
  [2667.428571428569, 4675.714285714286],
  [2737.428571428569, 4825.714285714286],
  [2667.428571428569, 4975.714285714286],
  [2657.428571428569, 5180.0],
  [3027.428571428569, 3920.0],
  [2764.5714285714257, 4070.0],
  [2643.142857142855, 4220.0],
  [2647.428571428569, 4418.571428571428],
  [2903.142857142855, 4220.0],
  [2907.428571428569, 4418.571428571428],
  [3021.714285714281, 4614.285714285714],
  [2891.714285714281, 4778.571428571429],
  [2884.571428571424, 4968.571428571429],
  [3151.714285714281, 4778.571428571429],
  [3144.571428571424, 4968.571428571429],
  [3650.285714285712, 4331.428571428572],
  [3470.285714285712, 4478.571428571429],
  [3348.8571428571413, 4628.571428571429],
  [3353.142857142855, 4827.142857142858],
  [3608.8571428571413, 4628.571428571429],
  [3613.142857142855, 4827.142857142858],
  [3747.428571428569, 5105.714285714286],
  [3617.428571428569, 5270.000000000002],
  [3610.285714285712, 5460.000000000002],
  [3877.428571428569, 5270.000000000002],
  [3870.285714285712, 5460.000000000002],
  [4673.142857142855, 4200.0],
  [4743.142857142855, 4350.0],
  [4673.142857142855, 4500.0],
  [4743.142857142855, 4650.0],
  [4733.142857142855, 4840.0],
  [4024.5714285714257, 4022.857142857142],
  [4094.5714285714257, 4172.857142857142],
  [4024.5714285714257, 4322.857142857142],
  [3848.8571428571395, 4467.142857142857],
  [4028.8571428571377, 4595.714285714284],
  [4018.8571428571377, 4785.714285714284],
  [4248.857142857138, 4452.857142857141],
  [4238.857142857138, 4642.857142857141],
  [5173.142857142855, 4097.142857142857],
  [5243.142857142855, 4247.142857142857],
  [5173.142857142855, 4397.142857142857],
  [4948.857142857141, 4547.142857142858],
  [5165.999999999998, 4615.714285714286],
  [5155.999999999998, 4805.714285714286],
  [5414.571428571426, 4550.000000000001],
  [5404.571428571426, 4740.000000000001],
  [5447.428571428568, 4040.0],
  [5440.285714285711, 4230.0],
  [5707.428571428568, 4040.0],
  [5700.285714285711, 4230.0],
  [5967.428571428568, 4040.0],
  [5960.285714285711, 4230.0],
  [6227.428571428568, 4040.0],
  [6220.285714285711, 4230.0],
  [6487.428571428568, 4040.0],
  [6480.285714285711, 4230.0],
  [6747.428571428568, 4040.0],
  [6740.285714285711, 4230.0],
  [7007.428571428568, 4040.0],
  [7000.285714285711, 4230.0],
  [-2250.665367126465, 1516.0],
  [-1726.301730762828, 2373.0909090909095]
]

rogue_v2_created_nodes = rogue_v2.nodes.where.not(node_type: 'root').order(:id).to_a

if rogue_v2_created_nodes.length == rogue_v2_position_overrides.length
  rogue_v2_created_nodes.zip(rogue_v2_position_overrides).each do |node, (position_x, position_y)|
    node.update_columns(position_x: position_x, position_y: position_y)
  end
end

rogue_v2.compile_program!
