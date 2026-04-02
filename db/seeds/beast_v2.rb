# Standalone seed file for Beast v2.

require_relative 'helpers'

user = seed_user!

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
