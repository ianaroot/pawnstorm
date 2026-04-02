# Standalone seed file for Professor X v2.

require_relative 'helpers'

user = seed_user!

phoenix_v2 = user.bots.find_by!(name: 'Phoenix v2')

professor_x_v2 = user.bots.find_or_initialize_by(name: 'Professor X v2')
professor_x_v2.description = 'A sharper Phoenix clone with extra tactical strike and king-pressure conversion overlays inspired by the original Wolverine concept.'
professor_x_v2.save!

clone_bot_graph!(source_bot: phoenix_v2, target_bot: professor_x_v2)

professor_x_root = professor_x_v2.root_node
professor_x_tactics = create_organizer!(bot: professor_x_v2, position_x: 11880, position_y: 1080, title: 'Professor X Tactics')
professor_x_pressure = create_organizer!(bot: professor_x_v2, position_x: 12380, position_y: 1080, title: 'Professor X Pressure')

connect!(professor_x_root, professor_x_tactics)
connect!(professor_x_root, professor_x_pressure)

create_shared_split_paths!(
  bot: professor_x_v2,
  start_node: professor_x_tactics,
  x: 11740,
  y: 1240,
  zigzag_offset: 70,
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

create_shared_split_paths!(
  bot: professor_x_v2,
  start_node: professor_x_tactics,
  x: 12260,
  y: 1240,
  zigzag_offset: 70,
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
      value: 60
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 60
    }
  ]
)

create_path!(
  bot: professor_x_v2,
  start_node: professor_x_tactics,
  x: 12720,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 50
)

professor_x_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

professor_x_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 12240 + (index * 980)

  create_shared_split_paths!(
    bot: professor_x_v2,
    start_node: professor_x_pressure,
    x: base_x,
    y: 1240,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: safety_conditions + [
      cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    variants: [
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 28
      },
      {
        conditions: [
          cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 26
      },
      {
        conditions: [
          cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 1)
        ],
        action_type: 'add',
        value: 16
      }
    ]
  )
end

create_path!(
  bot: professor_x_v2,
  start_node: professor_x_pressure,
  x: 13320,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 34
)

professor_x_v2.compile_program!
