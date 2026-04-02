# Standalone seed file for Nightcrawler v2.

require_relative 'helpers'

user = seed_user!

nightcrawler_v2 = user.bots.find_or_initialize_by(name: 'Nightcrawler v2')
nightcrawler_v2.description = 'A behavior-preserving refactor target for Nightcrawler using shared graph trunks instead of repeated flat seed paths.'
nightcrawler_v2.save!

reset_bot_graph!(nightcrawler_v2)

nightcrawler_root = nightcrawler_v2.root_node

nightcrawler_terminal = create_organizer!(bot: nightcrawler_v2, position_x: 120, position_y: 120, title: 'Terminal')
nightcrawler_opening = create_organizer!(bot: nightcrawler_v2, position_x: 860, position_y: 120, title: 'Opening')
nightcrawler_tactics = create_organizer!(bot: nightcrawler_v2, position_x: 1780, position_y: 120, title: 'Punish')
nightcrawler_pressure = create_organizer!(bot: nightcrawler_v2, position_x: 3240, position_y: 120, title: 'Pressure')
nightcrawler_fallback = create_organizer!(bot: nightcrawler_v2, position_x: 4720, position_y: 120, title: 'Fallback')

[nightcrawler_terminal, nightcrawler_opening, nightcrawler_tactics, nightcrawler_pressure, nightcrawler_fallback].each do |organizer|
  connect!(nightcrawler_root, organizer)
end

create_path!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_terminal,
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
  bot: nightcrawler_v2,
  start_node: nightcrawler_terminal,
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
  bot: nightcrawler_v2,
  start_node: nightcrawler_opening,
  x: 760,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: opening_game_conditions,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 13
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 1680,
  y: 280,
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
      value: 112
    },
    {
      conditions: [],
      action_type: 'return',
      value: 102
    }
  ]
)

create_path!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 2200,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ],
  action_type: 'return',
  value: 96
)

create_path!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 2460,
  y: 280,
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
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 2720,
  y: 280,
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
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 2980,
  y: 280,
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
  bot: nightcrawler_v2,
  start_node: nightcrawler_tactics,
  x: 3240,
  y: 280,
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

create_shared_split_paths!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_pressure,
  x: 3140,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: nightcrawler_pressure_safety.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'return',
      value: 30
    }
  end
)

create_shared_split_paths!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_pressure,
  x: 4120,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
  ],
  variants: nightcrawler_pressure_safety.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'add',
      value: 14
    }
  end
)

create_path!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_fallback,
  x: 4620,
  y: 280,
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

create_shared_split_paths!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_fallback,
  x: 4880,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
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
    }
  ]
)

create_path!(
  bot: nightcrawler_v2,
  start_node: nightcrawler_fallback,
  x: 5400,
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

nightcrawler_v2.compile_program!
