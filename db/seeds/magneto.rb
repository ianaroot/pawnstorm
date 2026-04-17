# Standalone seed file for Magneto.

require_relative 'helpers'

user = seed_user!

magneto = user.bots.find_or_initialize_by(name: 'Magneto')
magneto.description = 'A fresh control bot built on the V2 condition grammar, focused on constriction, punishing exposed pieces, and decisive material conversion.'
magneto.save!

reset_bot_graph!(magneto)

magneto_root = magneto.root_node

magneto_terminal = create_organizer!(
  bot: magneto,
  position_x: 120,
  position_y: 120,
  title: 'Terminal',
  notes: 'Forced game-ending outcomes.'
)
magneto_opening = create_organizer!(
  bot: magneto,
  position_x: 900,
  position_y: 120,
  title: 'Opening Doctrine',
  notes: 'Phase gate plus principled early development and queen discipline.'
)
magneto_expose = create_organizer!(
  bot: magneto,
  position_x: 2200,
  position_y: 120,
  title: 'Expose Target',
  notes: 'Create pressure that makes enemy pieces or the king easier to punish next.'
)
magneto_punish = create_organizer!(
  bot: magneto,
  position_x: 3580,
  position_y: 120,
  title: 'Punish Exposure',
  notes: 'Convert exposed targets into decisive tactical returns.'
)
magneto_reject = create_organizer!(
  bot: magneto,
  position_x: 4940,
  position_y: 120,
  title: 'Reject Loose Moves',
  notes: 'Refuse moves that leave the moved piece loose or tactically unjustified.'
)
magneto_constriction = create_organizer!(
  bot: magneto,
  position_x: 6320,
  position_y: 120,
  title: 'King Constriction',
  notes: 'Reward safe moves that tighten the enemy king box.'
)
magneto_endgame = create_organizer!(
  bot: magneto,
  position_x: 7800,
  position_y: 120,
  title: 'Endgame Conversion',
  notes: 'Convert low-material positions through king activity and safe pawn progress.'
)
magneto_fallback = create_organizer!(
  bot: magneto,
  position_x: 9240,
  position_y: 120,
  title: 'Fallback Control',
  notes: 'Small shaping preferences after tactical and phase-specific trunks miss.'
)

[
  magneto_terminal,
  magneto_opening,
  magneto_expose,
  magneto_punish,
  magneto_reject,
  magneto_constriction,
  magneto_endgame,
  magneto_fallback
].each do |organizer|
  connect!(magneto_root, organizer)
end

create_path!(
  bot: magneto,
  start_node: magneto_terminal,
  x: 80,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    rel_v2(subject: 'allied', operator: 'attack', target: 'enemy', target_filter: 'king'),
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: magneto,
  start_node: magneto_terminal,
  x: 320,
  y: 280,
  zigzag_offset: 60,
  conditions: [
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'equal_to', comparison_value: 0),
    rel_v2(
      subject: 'allied',
      operator: 'attack',
      target: 'enemy',
      target_filter: 'king',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 0
    )
  ],
  action_type: 'return',
  value: -100
)

magneto_opening_trunk = create_condition_chain!(
  bot: magneto,
  start_node: magneto_opening,
  x: 760,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions_v2
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_opening_trunk,
  x: 760,
  y: 2230,
  zigzag_offset: 80,
  branch_spacing: 320,
  shared_conditions: [
    unary_v2(subject: 'moved_piece', filter: 'knight', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    unary_v2(subject: 'moved_piece', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
    rel_v2(
      subject: 'allied',
      operator: 'defend',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'greater_than',
      subject_comparison_value: 0
    )
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 16
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 'prior_board_state'
        )
      ],
      action_type: 'return',
      value: 14
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_opening_trunk,
  x: 1480,
  y: 2230,
  zigzag_offset: 80,
  branch_spacing: 320,
  shared_conditions: [
    unary_v2(subject: 'moved_piece', filter: 'bishop', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    unary_v2(subject: 'moved_piece', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
    rel_v2(
      subject: 'allied',
      operator: 'defend',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'greater_than',
      subject_comparison_value: 0
    )
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 15
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 'prior_board_state'
        )
      ],
      action_type: 'return',
      value: 13
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_opening_trunk,
  x: 2200,
  y: 2230,
  zigzag_offset: 80,
  branch_spacing: 360,
  shared_conditions: [
    unary_v2(subject: 'moved_piece', filter: 'pawn', operator: 'count', comparator: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [
        unary_v2(subject: 'allied', filter: 'bishop', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 10
    },
    {
      conditions: [
        unary_v2(subject: 'allied', filter: 'knight', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 9
    }
  ]
)

create_path!(
  bot: magneto,
  start_node: magneto_opening_trunk,
  x: 2920,
  y: 2230,
  zigzag_offset: 80,
  conditions: [
    unary_v2(subject: 'moved_piece', filter: 'queen', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 0),
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'equal_to', comparison_value: 'prior_board_state'),
    rel_v2(
      subject: 'allied',
      operator: 'attack',
      target: 'enemy',
      target_filter: 'king',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 'prior_board_state'
    )
  ],
  action_type: 'return',
  value: -18
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_expose,
  x: 2080,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 360,
  shared_conditions: [
    rel_v2(
      subject: 'moved_piece',
      operator: 'attack',
      target: 'enemy',
      target_filter: 'pawn',
      target_filter_mode: 'exclude',
      target_comparison_metric: 'count',
      target_comparator: 'greater_than',
      target_comparison_value: 0
    )
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'add',
      value: 7
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_expose,
  x: 2800,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 360,
  shared_conditions: [
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'less_than', comparison_value: 'prior_board_state'),
    unary_v2(subject: 'moved_piece', filter: 'queen', operator: 'count', comparator: 'equal_to', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'attack',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 'prior_board_state'
        )
      ],
      action_type: 'return',
      value: 20
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'shield',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'less_than',
          subject_comparison_value: 'prior_board_state'
        ),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 18
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_punish,
  x: 3440,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'greater_than', comparison_value: 'moved_piece_value')
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 110
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 100
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_punish,
  x: 4160,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    rel_v2(subject: 'captured_piece', operator: 'same_piece', target: 'enemy_moved_piece')
  ],
  variants: [
    {
      conditions: [
        unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'greater_than', comparison_value: 'moved_piece_value'),
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 104
    },
    {
      conditions: [
        unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'greater_than', comparison_value: 'moved_piece_value'),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 96
    },
    {
      conditions: [
        unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'equal_to', comparison_value: 'moved_piece_value'),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 84
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_punish,
  x: 4980,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    unary_v2(subject: 'moved_piece', filter: 'knight', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    rel_v2(
      subject: 'moved_piece',
      operator: 'attack',
      target: 'enemy',
      target_filter: 'pawn',
      target_filter_mode: 'exclude',
      target_comparison_metric: 'count',
      target_comparator: 'greater_than',
      target_comparison_value: 1
    )
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 62
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 60
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_punish,
  x: 5820,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 320,
  shared_conditions: [
    rel_v2(subject: 'moved_piece', operator: 'attack', target: 'enemy', target_filter: 'queen')
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'defend',
          target: 'enemy',
          target_filter: 'queen',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 1
        ),
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 48
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 46
    }
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_reject,
  x: 4800,
  y: 280,
  zigzag_offset: 70,
  branch_spacing: 340,
  shared_conditions: [
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'greater_than',
      subject_comparison_value: 0
    )
  ],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        ),
        unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: -36
    },
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        ),
        unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'less_than', comparison_value: 'moved_piece_value')
      ],
      action_type: 'return',
      value: -42
    }
  ]
)

create_path!(
  bot: magneto,
  start_node: magneto_reject,
  x: 5580,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    unary_v2(subject: 'moved_piece', filter: 'queen', operator: 'count', comparator: 'greater_than', comparison_value: 0),
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 0),
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'equal_to', comparison_value: 'prior_board_state'),
    rel_v2(
      subject: 'allied',
      operator: 'attack',
      target: 'enemy',
      target_filter: 'king',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 'prior_board_state'
    )
  ],
  action_type: 'return',
  value: -30
)

magneto_constriction_trunk = create_condition_chain!(
  bot: magneto,
  start_node: magneto_constriction,
  x: 6180,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'less_than', comparison_value: 'prior_board_state'),
    unary_v2(subject: 'moved_piece', filter: 'queen', operator: 'count', comparator: 'equal_to', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_constriction_trunk,
  x: 6180,
  y: 580,
  zigzag_offset: 70,
  branch_spacing: 360,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'attack',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 'prior_board_state'
        ),
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 28
    },
    {
      conditions: [
        rel_v2(
          subject: 'allied',
          operator: 'adjacent',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 'prior_board_state'
        ),
        rel_v2(
          subject: 'enemy',
          operator: 'shield',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'less_than',
          subject_comparison_value: 'prior_board_state'
        )
      ],
      action_type: 'return',
      value: 26
    },
    {
      conditions: [
        rel_v2(
          subject: 'enemy',
          operator: 'shield',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'less_than',
          subject_comparison_value: 'prior_board_state'
        ),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 22
    }
  ]
)

magneto_endgame_trunk = create_condition_chain!(
  bot: magneto,
  start_node: magneto_endgame,
  x: 7660,
  y: 280,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions_v2
)

create_shared_split_paths!(
  bot: magneto,
  start_node: magneto_endgame_trunk,
  x: 7660,
  y: 580,
  zigzag_offset: 70,
  branch_spacing: 360,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        unary_v2(subject: 'moved_piece', filter: 'king', operator: 'count', comparator: 'greater_than', comparison_value: 0),
        unary_v2(subject: 'moved_piece', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
        rel_v2(
          subject: 'enemy',
          operator: 'attack',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'equal_to',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 20
    },
    {
      conditions: [
        unary_v2(subject: 'moved_piece', filter: 'pawn', operator: 'count', comparator: 'greater_than', comparison_value: 0),
        unary_v2(subject: 'moved_piece', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 18
    },
    {
      conditions: [
        unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 1),
        unary_v2(subject: 'captured_piece', operator: 'value', comparator: 'greater_than', comparison_value: 'moved_piece_value'),
        rel_v2(
          subject: 'allied',
          operator: 'defend',
          target: 'moved_piece',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 0
        )
      ],
      action_type: 'return',
      value: 36
    },
    {
      conditions: [
        unary_v2(subject: 'enemy', filter: 'king', operator: 'mobility', comparator: 'less_than', comparison_value: 'prior_board_state'),
        rel_v2(
          subject: 'allied',
          operator: 'attack',
          target: 'enemy',
          target_filter: 'king',
          subject_comparison_metric: 'count',
          subject_comparator: 'greater_than',
          subject_comparison_value: 'prior_board_state'
        )
      ],
      action_type: 'return',
      value: 32
    }
  ]
)

create_path!(
  bot: magneto,
  start_node: magneto_fallback,
  x: 9100,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    unary_v2(subject: 'moved_piece', operator: 'mobility', comparator: 'greater_than', comparison_value: 'prior_board_state'),
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 0
    )
  ],
  action_type: 'add',
  value: 5
)

create_path!(
  bot: magneto,
  start_node: magneto_fallback,
  x: 9460,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    rel_v2(
      subject: 'allied',
      operator: 'defend',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'greater_than',
      subject_comparison_value: 'prior_board_state'
    )
  ],
  action_type: 'add',
  value: 4
)

create_path!(
  bot: magneto,
  start_node: magneto_fallback,
  x: 9820,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    rel_v2(
      subject: 'moved_piece',
      operator: 'attack',
      target: 'enemy',
      target_comparison_metric: 'count',
      target_comparator: 'greater_than',
      target_comparison_value: 'prior_board_state'
    ),
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'equal_to',
      subject_comparison_value: 0
    )
  ],
  action_type: 'add',
  value: 6
)

create_path!(
  bot: magneto,
  start_node: magneto_fallback,
  x: 10180,
  y: 280,
  zigzag_offset: 70,
  conditions: [
    rel_v2(
      subject: 'enemy',
      operator: 'attack',
      target: 'moved_piece',
      subject_comparison_metric: 'count',
      subject_comparator: 'greater_than',
      subject_comparison_value: 'prior_board_state'
    ),
    unary_v2(subject: 'captured_piece', operator: 'count', comparator: 'equal_to', comparison_value: 0)
  ],
  action_type: 'subtract',
  value: 6
)

magneto.compile_program!
