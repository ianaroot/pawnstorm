# Standalone seed file for Colossus v2.

require_relative 'helpers'

user = seed_user!

colossus_v2 = user.bots.find_or_initialize_by(name: 'Colossus v2')
colossus_v2.description = 'A behavior-preserving refactor target for Colossus built on the Cyclops v2 base with shared graph trunks for conversion and discipline logic.'
colossus_v2.save!

cyclops_v2 = user.bots.find_by!(name: 'Cyclops v2')
clone_bot_graph!(source_bot: cyclops_v2, target_bot: colossus_v2)

colossus_root = colossus_v2.root_node
colossus_conversion = create_organizer!(bot: colossus_v2, position_x: 11040, position_y: 4040, title: 'Colossus Conversion')
colossus_discipline = create_organizer!(bot: colossus_v2, position_x: 11620, position_y: 4040, title: 'Colossus Discipline')

connect!(colossus_root, colossus_conversion)
connect!(colossus_root, colossus_discipline)

colossus_conversion_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

colossus_support_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

colossus_support_pressure_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

colossus_conversion_shared_start = create_condition_chain!(
  bot: colossus_v2,
  start_node: colossus_conversion,
  x: 10920,
  y: 4200,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: colossus_v2,
  start_node: colossus_conversion_shared_start,
  x: 10920,
  y: 4500,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
  ],
  variants: colossus_conversion_safety.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'return',
      value: 26
    }
  end
)

create_shared_split_paths!(
  bot: colossus_v2,
  start_node: colossus_conversion_shared_start,
  x: 11580,
  y: 4500,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  variants: colossus_conversion_safety.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'return',
      value: 26
    }
  end
)

colossus_conversion_endgame_start = create_condition_chain!(
  bot: colossus_v2,
  start_node: colossus_conversion,
  x: 12240,
  y: 4200,
  conditions: endgame_gate_conditions + colossus_support_box_core,
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: colossus_v2,
  start_node: colossus_conversion_endgame_start,
  x: 12240,
  y: 4950,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [],
  variants: colossus_conversion_safety.map do |safety_conditions|
    {
      conditions: safety_conditions,
      action_type: 'return',
      value: 40
    }
  end
)

create_shared_split_paths!(
  bot: colossus_v2,
  start_node: colossus_discipline,
  x: 11500,
  y: 4200,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'subtract',
      value: 16
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'subtract',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'subtract',
      value: 14
    }
  ]
)

create_shared_split_paths!(
  bot: colossus_v2,
  start_node: colossus_discipline,
  x: 12280,
  y: 4200,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 10
    }
  ]
)

create_path!(
  bot: colossus_v2,
  start_node: colossus_discipline,
  x: 12800,
  y: 4200,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 12
)

colossus_v2.compile_program!
