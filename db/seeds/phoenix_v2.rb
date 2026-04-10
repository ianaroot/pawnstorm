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
phoenix_guppy_conversion = create_organizer!(
  bot: phoenix_v2,
  position_x: 10420,
  position_y: 1080,
  title: 'Guppy Tweak 2',
  notes: 'Rewards conversion moves that newly bind the enemy’s last-moved non-pawn to shielding its king.'
)
phoenix_guppy_discipline = create_organizer!(
  bot: phoenix_v2,
  position_x: 11840,
  position_y: 1080,
  title: 'Guppy Tweak 2',
  notes: 'Allows a queen move when it directly hits the enemy’s last-moved piece and the queen remains unattacked.'
)
phoenix_guppy_recap = create_organizer!(
  bot: phoenix_v2,
  position_x: 12120,
  position_y: 1080,
  title: 'Guppy Tweak 2',
  notes: 'Allows a queen recapture when the opponent just captured and the queen safely takes that last-moved piece back.'
)

connect!(phoenix_root, phoenix_conversion)
connect!(phoenix_root, phoenix_discipline)
connect!(phoenix_root, phoenix_guppy_conversion)
connect!(phoenix_root, phoenix_guppy_discipline)
connect!(phoenix_root, phoenix_guppy_recap)

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

  phoenix_conversion_safety_trunk = create_condition_chain!(
    bot: phoenix_v2,
    start_node: phoenix_conversion,
    x: base_x,
    y: 1240,
    conditions: safety_conditions,
    zigzag_offset: 70
  )

  phoenix_conversion_piece_trunk = create_condition_chain!(
    bot: phoenix_v2,
    start_node: phoenix_conversion_safety_trunk,
    x: base_x,
    y: 1390,
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    zigzag_offset: 70
  )

  create_shared_split_paths!(
    bot: phoenix_v2,
    start_node: phoenix_conversion_piece_trunk,
    x: base_x,
    y: 1690,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: [],
    variants: [
      {
        conditions: [
          cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 24
      },
      {
        conditions: [
          cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 22
      },
      {
        conditions: endgame_gate_conditions + [
          cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
        ],
        action_type: 'return',
        value: 36
      }
    ]
  )
end

create_path!(
  bot: phoenix_v2,
  start_node: phoenix_guppy_conversion,
  x: 10420,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    rel_v2(
      subject: 'enemy_moved_piece',
      subject_filter: 'pawn',
      subject_filter_mode: 'exclude',
      operator: 'shield',
      target: 'enemy',
      target_filter: 'king',
      target_comparison_metric: 'count',
      target_comparator: 'greater_than',
      target_comparison_value: 'prior_board_state'
    ),
    rel_v2(subject: 'moved_piece', operator: 'attack', target: 'enemy_moved_piece')
  ],
  action_type: 'add',
  value: 16
)

phoenix_discipline_queen_trunk = create_condition_chain!(
  bot: phoenix_v2,
  start_node: phoenix_discipline,
  x: 11240,
  y: 1240,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ],
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: phoenix_v2,
  start_node: phoenix_discipline_queen_trunk,
  x: 11240,
  y: 1390,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [
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
  start_node: phoenix_discipline_queen_trunk,
  x: 11760,
  y: 1390,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 18
)

create_path!(
  bot: phoenix_v2,
  start_node: phoenix_guppy_discipline,
  x: 11840,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    rel_v2(subject: 'moved_piece', subject_filter: 'queen', operator: 'attack', target: 'enemy_moved_piece'),
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      target_filter: 'queen',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 0
    )
  ],
  action_type: 'add',
  value: 12
)

create_path!(
  bot: phoenix_v2,
  start_node: phoenix_guppy_recap,
  x: 12120,
  y: 1240,
  zigzag_offset: 70,
  conditions: [
    unary_v2(subject: 'moved_piece', filter: 'queen', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    unary_v2(subject: 'enemy_captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    rel_v2(subject: 'captured_piece', operator: 'same_piece', target: 'enemy_moved_piece'),
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      target_filter: 'queen',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 0
    )
  ],
  action_type: 'add',
  value: 16
)

phoenix_v2.compile_program!
