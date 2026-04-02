# Standalone seed file for Phoenix v2.

require_relative 'helpers'

user = seed_user!

rogue_v2 = user.bots.find_by!(name: 'Rogue v2')

phoenix_v2 = user.bots.find_or_initialize_by(name: 'Phoenix v2')
phoenix_v2.description = 'A behavior-preserving refactor target for Phoenix using shared graph trunks for the Phoenix-specific conversion and discipline branches.'
phoenix_v2.save!

clone_bot_graph!(source_bot: rogue_v2, target_bot: phoenix_v2)

phoenix_root = phoenix_v2.root_node
phoenix_conversion = create_organizer!(bot: phoenix_v2, position_x: 10880, position_y: 1080, title: 'Phoenix Conversion')
phoenix_discipline = create_organizer!(bot: phoenix_v2, position_x: 11380, position_y: 1080, title: 'Phoenix Discipline')

connect!(phoenix_root, phoenix_conversion)
connect!(phoenix_root, phoenix_discipline)

phoenix_conversion_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

phoenix_helper_constriction_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

phoenix_helper_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

phoenix_conversion_safety.each_with_index do |safety_conditions, index|
  base_x = 10740 + (index * 940)

  create_shared_split_paths!(
    bot: phoenix_v2,
    start_node: phoenix_conversion,
    x: base_x,
    y: 1240,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: phoenix_helper_constriction_core,
        action_type: 'return',
        value: 24
      },
      {
        conditions: phoenix_helper_box_core,
        action_type: 'return',
        value: 22
      },
      {
        conditions: endgame_gate_conditions + phoenix_helper_constriction_core,
        action_type: 'return',
        value: 36
      }
    ]
  )
end

create_shared_split_paths!(
  bot: phoenix_v2,
  start_node: phoenix_discipline,
  x: 11240,
  y: 1240,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 18
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 18
    }
  ]
)

create_path!(
  bot: phoenix_v2,
  start_node: phoenix_discipline,
  x: 11760,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

phoenix_v2.compile_program!
