# Standalone seed file for Bishop v2.

require_relative 'helpers'

user = seed_user!

bishop_v2 = user.bots.find_or_initialize_by(name: 'Bishop v2')
bishop_v2.description = 'A behavior-preserving refactor target for Bishop using shared graph trunks instead of repeated flat seed paths.'
bishop_v2.save!

reset_bot_graph!(bishop_v2)

bishop_root = bishop_v2.root_node

terminal_organizer = create_organizer!(bot: bishop_v2, position_x: 120, position_y: 120, title: 'Terminal')
opening_organizer = create_organizer!(bot: bishop_v2, position_x: 760, position_y: 120, title: 'Opening')
tactics_organizer = create_organizer!(bot: bishop_v2, position_x: 460, position_y: 1730, title: 'Tactics')
pressure_organizer = create_organizer!(bot: bishop_v2, position_x: 1880, position_y: 980, title: 'King Pressure')
endgame_organizer = create_organizer!(bot: bishop_v2, position_x: 2850, position_y: 760, title: 'Endgame')
fallback_organizer = create_organizer!(bot: bishop_v2, position_x: 3900, position_y: 1260, title: 'Fallback')

[terminal_organizer, opening_organizer, tactics_organizer, pressure_organizer, endgame_organizer, fallback_organizer].each do |organizer|
  connect!(bishop_root, organizer)
end

create_path!(
  bot: bishop_v2,
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
  bot: bishop_v2,
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

opening_trunk = create_condition_chain!(
  bot: bishop_v2,
  start_node: opening_organizer,
  x: 660,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions
)

create_shared_split_paths!(
  bot: bishop_v2,
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
      value: 12
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 12
    }
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
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
      value: 11
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')],
      action_type: 'add',
      value: 11
    }
  ]
)

pawn_opening_trunk = create_condition_chain!(
  bot: bishop_v2,
  start_node: opening_trunk,
  x: 1700,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: pawn_opening_trunk,
  x: 1700,
  y: 2530,
  zigzag_offset: 80,
  branch_spacing: 520,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: pawn_opening_trunk,
  x: 2220,
  y: 2530,
  zigzag_offset: 80,
  branch_spacing: 520,
  shared_conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: tactics_organizer,
  x: 360,
  y: 1890,
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
  bot: bishop_v2,
  start_node: tactics_organizer,
  x: 900,
  y: 1890,
  zigzag_offset: 60,
  branch_spacing: 280,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'return',
      value: 55
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 55
    }
  ]
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

pressure_safety_condition_sets = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

pressure_safety_condition_sets.each_with_index do |safety_conditions, index|
  base_x = 1740 + (index * 230)

  create_path!(
    bot: bishop_v2,
    start_node: pressure_organizer,
    x: base_x,
    y: 1140,
    zigzag_offset: 70,
    conditions: tighten_core + safety_conditions,
    action_type: 'return',
    value: 34
  )

  create_path!(
    bot: bishop_v2,
    start_node: pressure_organizer,
    x: base_x,
    y: 1710,
    zigzag_offset: 70,
    conditions: strip_core + safety_conditions,
    action_type: 'return',
    value: 30
  )

  create_path!(
    bot: bishop_v2,
    start_node: pressure_organizer,
    x: base_x,
    y: 2280,
    zigzag_offset: 70,
    conditions: forcing_core + safety_conditions,
    action_type: 'add',
    value: 14
  )
end

endgame_trunk = create_condition_chain!(
  bot: bishop_v2,
  start_node: endgame_organizer,
  x: 2720,
  y: 920,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: endgame_trunk,
  x: 2720,
  y: 1220,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
      action_type: 'return',
      value: 95
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 95
    }
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: endgame_trunk,
  x: 3240,
  y: 1220,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')],
      action_type: 'return',
      value: 24
    },
    {
      conditions: [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
      action_type: 'return',
      value: 24
    }
  ]
)

create_path!(
  bot: bishop_v2,
  start_node: endgame_trunk,
  x: 3760,
  y: 1220,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'add',
  value: 12
)

endgame_pressure_trunk = create_condition_chain!(
  bot: bishop_v2,
  start_node: endgame_trunk,
  x: 3920,
  y: 1220,
  zigzag_offset: 70,
  conditions: tighten_core
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: endgame_pressure_trunk,
  x: 3920,
  y: 1520,
  zigzag_offset: 70,
  branch_spacing: 230,
  shared_conditions: [],
  variants: pressure_safety_condition_sets.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'return',
      value: 28
    }
  end
)

controlled_tension_trunk = create_condition_chain!(
  bot: bishop_v2,
  start_node: fallback_organizer,
  x: 3860,
  y: 1420,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: bishop_v2,
  start_node: controlled_tension_trunk,
  x: 3860,
  y: 2020,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', relation_specifier_mode: 'exclude', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 7
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 7
    }
  ]
)

create_path!(
  bot: bishop_v2,
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
  bot: bishop_v2,
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
  bot: bishop_v2,
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
  bot: bishop_v2,
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
  bot: bishop_v2,
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

bishop_v2.compile_program!
