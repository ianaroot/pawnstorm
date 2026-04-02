# Standalone seed file for Cyclops v2.

require_relative 'helpers'

user = seed_user!

def radial_child_offsets(count, radius_x: 260, radius_y: 220)
  case count
  when 2
    [[-radius_x, 0], [radius_x, 0]]
  when 3
    [[-radius_x, 0], [0, radius_y], [radius_x, 0]]
  when 4
    [[-radius_x, -radius_y], [-radius_x, radius_y], [radius_x, -radius_y], [radius_x, radius_y]]
  when 5
    [
      [-(radius_x * 0.9).round, -(radius_y * 0.9).round],
      [-(radius_x * 0.9).round, (radius_y * 0.45).round],
      [0, radius_y],
      [(radius_x * 0.9).round, (radius_y * 0.45).round],
      [(radius_x * 0.9).round, -(radius_y * 0.9).round]
    ]
  else
    Array.new(count) { |index| [index * radius_x, 0] }
  end
end

def create_radial_shared_split_paths!(bot:, start_node:, x:, y:, shared_conditions:, variants:, step_y: 150, zigzag_offset: 0, radius_x: 260, radius_y: 220)
  previous_node = start_node

  shared_conditions.each_with_index do |condition_data, index|
    node_x =
      if zigzag_offset.zero?
        x
      else
        x + ((index % 2 == 1) ? zigzag_offset : 0)
      end

    condition = create_condition!(
      bot: bot,
      position_x: node_x,
      position_y: y + (index * step_y),
      data: condition_data
    )
    connect!(previous_node, condition)
    previous_node = condition
  end

  shared_depth = shared_conditions.length
  split_y = y + ((shared_depth - 1) * step_y)
  offsets = radial_child_offsets(variants.length, radius_x: radius_x, radius_y: radius_y)

  variants.each_with_index do |variant, variant_index|
    offset_x, offset_y = offsets.fetch(variant_index)
    variant_start_x = x + offset_x
    variant_start_y = split_y + offset_y
    variant_previous_node = previous_node

    variant.fetch(:conditions).each_with_index do |condition_data, index|
      node_x =
        if zigzag_offset.zero?
          variant_start_x
        else
          variant_start_x + ((index % 2 == 1) ? zigzag_offset : 0)
        end

      condition = create_condition!(
        bot: bot,
        position_x: node_x,
        position_y: variant_start_y + (index * step_y),
        data: condition_data
      )
      connect!(variant_previous_node, condition)
      variant_previous_node = condition
    end

    action_x =
      if zigzag_offset.zero?
        variant_start_x
      else
        variant_start_x + ((variant.fetch(:conditions).length % 2 == 1) ? zigzag_offset : 0)
      end

    action_node = create_action!(
      bot: bot,
      position_x: action_x,
      position_y: variant_start_y + (variant.fetch(:conditions).length * step_y),
      action_type: variant.fetch(:action_type),
      value: variant.fetch(:value)
    )
    connect!(variant_previous_node, action_node)
  end
end

def create_split_then_shared_paths!(bot:, start_node:, x:, y:, branch_variants:, shared_suffix:, action_type:, value:, step_y: 150, zigzag_offset: 0, branch_spacing: 260)
  branch_variants.each_with_index do |branch_conditions, branch_index|
    branch_start_x = x + (branch_index * branch_spacing)
    previous_node = start_node

    branch_conditions.each_with_index do |condition_data, index|
      node_x =
        if zigzag_offset.zero?
          branch_start_x
        else
          branch_start_x + ((index % 2 == 1) ? zigzag_offset : 0)
        end

      condition = create_condition!(
        bot: bot,
        position_x: node_x,
        position_y: y + (index * step_y),
        data: condition_data
      )
      connect!(previous_node, condition)
      previous_node = condition
    end

    branch_depth = branch_conditions.length

    shared_suffix.each_with_index do |condition_data, index|
      node_x =
        if zigzag_offset.zero?
          branch_start_x
        else
          branch_start_x + (((branch_depth + index) % 2 == 1) ? zigzag_offset : 0)
        end

      condition = create_condition!(
        bot: bot,
        position_x: node_x,
        position_y: y + ((branch_depth + index) * step_y),
        data: condition_data
      )
      connect!(previous_node, condition)
      previous_node = condition
    end

    total_depth = branch_depth + shared_suffix.length
    action_x =
      if zigzag_offset.zero?
        branch_start_x
      else
        branch_start_x + ((total_depth % 2 == 1) ? zigzag_offset : 0)
      end

    action_node = create_action!(
      bot: bot,
      position_x: action_x,
      position_y: y + (total_depth * step_y),
      action_type: action_type,
      value: value
    )
    connect!(previous_node, action_node)
  end
end


cyclops_v2 = user.bots.find_or_initialize_by(name: 'Cyclops v2')
cyclops_v2.description = 'A behavior-preserving refactor target for Cyclops using shared graph trunks instead of repeated flat seed paths.'
cyclops_v2.save!

reset_bot_graph!(cyclops_v2)

cyclops_root = cyclops_v2.root_node

cyclops_terminal = create_organizer!(bot: cyclops_v2, position_x: -120, position_y: -520, title: 'Terminal')
cyclops_tactics = create_organizer!(bot: cyclops_v2, position_x: -1280, position_y: 40, title: 'Tactics')
cyclops_pressure = create_organizer!(bot: cyclops_v2, position_x: -1040, position_y: 1140, title: 'Pressure')
cyclops_fallback = create_organizer!(bot: cyclops_v2, position_x: -520, position_y: 2140, title: 'Fallback')
cyclops_endgame = create_organizer!(bot: cyclops_v2, position_x: 1760, position_y: 1740, title: 'Endgame')
cyclops_opening = create_organizer!(bot: cyclops_v2, position_x: 4060, position_y: 220, title: 'Opening')

[cyclops_terminal, cyclops_tactics, cyclops_pressure, cyclops_fallback, cyclops_endgame, cyclops_opening].each do |organizer|
  connect!(cyclops_root, organizer)
end

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_terminal,
  x: -180,
  y: -360,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 100
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_terminal,
  x: 80,
  y: -360,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_opening,
  x: 3920,
  y: 120,
  zigzag_offset: 70,
  radius_x: 320,
  radius_y: 250,
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
    }
  ]
)

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: create_condition_chain!(
    bot: cyclops_v2,
    start_node: create_condition_chain!(
      bot: cyclops_v2,
      start_node: cyclops_opening,
      x: 3920,
      y: 120,
      conditions: opening_game_conditions,
      zigzag_offset: 70
    ),
    x: 4560,
    y: 2220,
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
    ],
    zigzag_offset: 70
  ),
  x: 4560,
  y: 2370,
  zigzag_offset: 70,
  branch_spacing: 280,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 9
    },
    {
      conditions: [
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: -1500,
  y: 180,
  zigzag_offset: 60,
  radius_x: 300,
  radius_y: 240,
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
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: -920,
  y: 40,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 90
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: -760,
  y: 460,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 58
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: -180,
  y: 40,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'shielder', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'return',
  value: 48
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: 140,
  y: 420,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielded', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 44
)

cyclops_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)]
]

cyclops_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

cyclops_helper_pressure_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

cyclops_helper_box_core = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state')
]

cyclops_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = [-1440, -240][index]
  base_y = [1200, 1480][index]

  create_radial_shared_split_paths!(
    bot: cyclops_v2,
    start_node: cyclops_pressure,
    x: base_x,
    y: base_y,
    zigzag_offset: 70,
    radius_x: 360,
    radius_y: 260,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: cyclops_tighten_core,
        action_type: 'return',
        value: 34
      },
      {
        conditions: cyclops_helper_pressure_core,
        action_type: 'return',
        value: 24
      },
      {
        conditions: cyclops_helper_box_core,
        action_type: 'return',
        value: 22
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

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_pressure,
  x: 760,
  y: 1120,
  zigzag_offset: 70,
  radius_x: 260,
  radius_y: 220,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 14
    }
  ]
)

cyclops_endgame_start = create_condition_chain!(
  bot: cyclops_v2,
  start_node: cyclops_endgame,
  x: 1460,
  y: 1900,
  conditions: endgame_gate_conditions,
  zigzag_offset: 70
)

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_endgame_start,
  x: 1460,
  y: 2200,
  zigzag_offset: 70,
  branch_spacing: 360,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 88
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 24
    }
  ]
)

cyclops_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = [2460, 3440][index]
  base_y = [1840, 2140][index]

  create_radial_shared_split_paths!(
    bot: cyclops_v2,
    start_node: cyclops_endgame_start,
    x: base_x,
    y: base_y + 300,
    zigzag_offset: 70,
    radius_x: 340,
    radius_y: 240,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: cyclops_tighten_core,
        action_type: 'return',
        value: 34
      },
      {
        conditions: cyclops_helper_pressure_core,
        action_type: 'return',
        value: 36
      }
    ]
  )
end

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: -980,
  y: 2280,
  zigzag_offset: 70,
  radius_x: 280,
  radius_y: 220,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 7
    },
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

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: -60,
  y: 2140,
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

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 300,
  y: 2460,
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

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 900,
  y: 2180,
  zigzag_offset: 70,
  radius_x: 260,
  radius_y: 220,
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

create_radial_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 1360,
  y: 2520,
  zigzag_offset: 70,
  radius_x: 260,
  radius_y: 220,
  shared_conditions: [
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacked', relation_specifier: 'pawn', comparison: 'equal_to', comparison_value: 0)
  ],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'subtract',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'subtract',
      value: 8
    }
  ]
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 1880,
  y: 2240,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

cyclops_v2_position_overrides = [
  [-120.0, -520.0],
  [-1280.0, 40.0],
  [-1040.0, 1140.0],
  [-520.0, 2140.0],
  [1760.0, 1740.0],
  [4060.0, 220.0],
  [-180.0, -360.0],
  [-120.0, -210.0],
  [-180.0, -60.0],
  [80.0, -360.0],
  [140.0, -210.0],
  [80.0, -60.0],
  [3920.0, 120.0],
  [3990.0, 270.0],
  [3920.0, 420.0],
  [3990.0, 570.0],
  [3920.0, 720.0],
  [3990.0, 870.0],
  [3920.0, 1020.0],
  [3990.0, 1170.0],
  [3920.0, 1320.0],
  [3990.0, 1470.0],
  [3920.0, 1620.0],
  [3990.0, 1770.0],
  [3920.0, 1920.0],
  [3990.0, 2070.0],
  [3600.0, 2070.0],
  [3670.0, 2220.0],
  [3600.0, 2370.0],
  [3670.0, 2520.0],
  [4240.0, 2070.0],
  [4310.0, 2220.0],
  [4240.0, 2370.0],
  [4310.0, 2520.0],
  [3920.0, 120.0],
  [3990.0, 270.0],
  [3920.0, 420.0],
  [3990.0, 570.0],
  [3920.0, 720.0],
  [3990.0, 870.0],
  [3920.0, 1020.0],
  [3990.0, 1170.0],
  [3920.0, 1320.0],
  [3990.0, 1470.0],
  [3920.0, 1620.0],
  [3990.0, 1770.0],
  [3920.0, 1920.0],
  [3990.0, 2070.0],
  [4560.0, 2220.0],
  [4560.0, 2370.0],
  [4630.0, 2520.0],
  [4560.0, 2670.0],
  [4840.0, 2370.0],
  [4910.0, 2520.0],
  [4840.0, 2670.0],
  [-1500.0, 180.0],
  [-1800.0, 180.0],
  [-1740.0, 330.0],
  [-1200.0, 180.0],
  [-920.0, 40.0],
  [-860.0, 190.0],
  [-920.0, 340.0],
  [-760.0, 460.0],
  [-700.0, 610.0],
  [-760.0, 760.0],
  [-700.0, 910.0],
  [-180.0, 40.0],
  [-120.0, 190.0],
  [-180.0, 340.0],
  [-120.0, 490.0],
  [-180.0, 640.0],
  [140.0, 420.0],
  [200.0, 570.0],
  [140.0, 720.0],
  [-1440.0, 1200.0],
  [-1800.0, 940.0],
  [-1730.0, 1090.0],
  [-1800.0, 1240.0],
  [-1800.0, 1460.0],
  [-1730.0, 1610.0],
  [-1800.0, 1760.0],
  [-1730.0, 1910.0],
  [-1080.0, 940.0],
  [-1010.0, 1090.0],
  [-1080.0, 1240.0],
  [-1010.0, 1390.0],
  [-1080.0, 1460.0],
  [-1010.0, 1610.0],
  [-240.0, 1480.0],
  [-600.0, 1220.0],
  [-530.0, 1370.0],
  [-600.0, 1520.0],
  [-600.0, 1740.0],
  [-530.0, 1890.0],
  [-600.0, 2040.0],
  [-530.0, 2190.0],
  [120.0, 1220.0],
  [190.0, 1370.0],
  [120.0, 1520.0],
  [190.0, 1670.0],
  [120.0, 1740.0],
  [190.0, 1890.0],
  [760.0, 1120.0],
  [830.0, 1270.0],
  [760.0, 1420.0],
  [500.0, 1420.0],
  [570.0, 1570.0],
  [1020.0, 1420.0],
  [1090.0, 1570.0],
  [1460.0, 1900.0],
  [1530.0, 2050.0],
  [1460.0, 2200.0],
  [1530.0, 2350.0],
  [1460.0, 2500.0],
  [1820.0, 2200.0],
  [1890.0, 2350.0],
  [1820.0, 2500.0],
  [2460.0, 2140.0],
  [2120.0, 2140.0],
  [2190.0, 2290.0],
  [2120.0, 2440.0],
  [2800.0, 2140.0],
  [2870.0, 2290.0],
  [2800.0, 2440.0],
  [2870.0, 2590.0],
  [3440.0, 2440.0],
  [3100.0, 2440.0],
  [3170.0, 2590.0],
  [3100.0, 2740.0],
  [3780.0, 2440.0],
  [3850.0, 2590.0],
  [3780.0, 2740.0],
  [3850.0, 2890.0],
  [-980.0, 2280.0],
  [-910.0, 2430.0],
  [-980.0, 2580.0],
  [-1260.0, 2580.0],
  [-1190.0, 2730.0],
  [-980.0, 2800.0],
  [-910.0, 2950.0],
  [-700.0, 2580.0],
  [-630.0, 2730.0],
  [-60.0, 2140.0],
  [10.0, 2290.0],
  [-60.0, 2440.0],
  [10.0, 2590.0],
  [-60.0, 2740.0],
  [300.0, 2460.0],
  [370.0, 2610.0],
  [300.0, 2760.0],
  [370.0, 2910.0],
  [300.0, 3060.0],
  [900.0, 2180.0],
  [640.0, 2180.0],
  [710.0, 2330.0],
  [1160.0, 2180.0],
  [1230.0, 2330.0],
  [1160.0, 2480.0],
  [1360.0, 2520.0],
  [1430.0, 2670.0],
  [1360.0, 2820.0],
  [1100.0, 2820.0],
  [1170.0, 2970.0],
  [1620.0, 2820.0],
  [1690.0, 2970.0],
  [1880.0, 2240.0],
  [1950.0, 2390.0],
  [1880.0, 2540.0],
  [1950.0, 2690.0],
  [1880.0, 2840.0],
  [1950.0, 2990.0]
]

cyclops_v2_created_nodes = cyclops_v2.nodes.where.not(node_type: 'root').order(:id).to_a

if cyclops_v2_created_nodes.length == cyclops_v2_position_overrides.length
  cyclops_v2_created_nodes.zip(cyclops_v2_position_overrides).each do |node, (position_x, position_y)|
    node.update_columns(position_x: position_x, position_y: position_y)
  end
end

cyclops_v2.compile_program!
