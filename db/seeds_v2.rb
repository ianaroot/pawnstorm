# Experimental seed file for behavior-preserving bot refactors.

seed_email = ENV.fetch('SEED_USER_EMAIL', 'ianaroot@gmail.com')
seed_password = ENV.fetch('SEED_USER_PASSWORD', 'password123')

user = User.find_or_initialize_by(email: seed_email)
if user.new_record?
  user.password = seed_password
  user.password_confirmation = seed_password
end
user.save!

def reset_bot_graph!(bot)
  bot.nodes.where.not(node_type: 'root').destroy_all
  root = bot.root_node
  root.update!(position_x: 600, position_y: 50) if root
end

def create_condition!(bot:, position_x:, position_y:, data:)
  bot.nodes.create!(
    node_type: 'condition',
    position_x: position_x,
    position_y: position_y,
    data: data
  )
end

def create_action!(bot:, position_x:, position_y:, action_type:, value:)
  bot.nodes.create!(
    node_type: 'action',
    position_x: position_x,
    position_y: position_y,
    data: {
      actionType: action_type,
      value: value
    }
  )
end

def connect!(source, target)
  Connection.find_or_create_by!(source_node: source, target_node: target)
end

def create_organizer!(bot:, position_x:, position_y:, title:, notes: '')
  bot.nodes.create!(
    node_type: 'organizer',
    position_x: position_x,
    position_y: position_y,
    data: {
      title: title,
      notes: notes
    }
  )
end

def create_path!(bot:, start_node:, x:, y:, conditions:, action_type:, value:, step_y: 150, zigzag_offset: 0)
  previous_node = start_node

  conditions.each_with_index do |condition_data, index|
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

  action_x =
    if zigzag_offset.zero?
      x
    else
      x + ((conditions.length % 2 == 1) ? zigzag_offset : 0)
    end

  action_node = create_action!(
    bot: bot,
    position_x: action_x,
    position_y: y + (conditions.length * step_y),
    action_type: action_type,
    value: value
  )
  connect!(previous_node, action_node)
end

def clone_bot_graph!(source_bot:, target_bot:)
  reset_bot_graph!(target_bot)

  source_root = source_bot.root_node
  target_root = target_bot.root_node
  node_map = { source_root.id => target_root }

  source_bot.nodes.where.not(node_type: 'root').find_each do |node|
    node_map[node.id] = target_bot.nodes.create!(
      node_type: node.node_type,
      position_x: node.position_x,
      position_y: node.position_y,
      data: node.data.deep_dup
    )
  end

  source_bot.nodes.find_each do |node|
    node.outgoing_connections.find_each do |connection|
      connect!(node_map[connection.source_node_id], node_map[connection.target_node_id])
    end
  end
end

def create_shared_split_paths!(bot:, start_node:, x:, y:, shared_conditions:, variants:, step_y: 150, zigzag_offset: 0, branch_spacing: 260)
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

  variants.each_with_index do |variant, variant_index|
    variant_start_x = x + (variant_index * branch_spacing)
    variant_previous_node = previous_node

    variant.fetch(:conditions).each_with_index do |condition_data, index|
      node_x =
        if zigzag_offset.zero?
          variant_start_x
        else
          variant_start_x + (((shared_depth + index) % 2 == 1) ? zigzag_offset : 0)
        end

      condition = create_condition!(
        bot: bot,
        position_x: node_x,
        position_y: y + ((shared_depth + index) * step_y),
        data: condition_data
      )
      connect!(variant_previous_node, condition)
      variant_previous_node = condition
    end

    action_x =
      if zigzag_offset.zero?
        variant_start_x
      else
        total_depth = shared_depth + variant.fetch(:conditions).length
        variant_start_x + ((total_depth % 2 == 1) ? zigzag_offset : 0)
      end

    action_node = create_action!(
      bot: bot,
      position_x: action_x,
      position_y: y + ((shared_depth + variant.fetch(:conditions).length) * step_y),
      action_type: variant.fetch(:action_type),
      value: variant.fetch(:value)
    )
    connect!(variant_previous_node, action_node)
  end
end

def create_shared_path!(bot:, start_node:, x:, y:, shared_conditions:, action_type:, value:, step_y: 150, zigzag_offset: 0)
  create_path!(
    bot: bot,
    start_node: start_node,
    x: x,
    y: y,
    conditions: shared_conditions,
    action_type: action_type,
    value: value,
    step_y: step_y,
    zigzag_offset: zigzag_offset
  )
end

def create_condition_chain!(bot:, start_node:, x:, y:, conditions:, step_y: 150, zigzag_offset: 0)
  previous_node = start_node

  conditions.each_with_index do |condition_data, index|
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

  previous_node
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

def cond(
  subject:,
  relation:,
  comparison:,
  comparison_value:,
  subject_specifier: 'any',
  subject_specifier_mode: 'include',
  relation_specifier: 'any',
  relation_specifier_mode: 'include'
)
  {
    subject: subject,
    subjectSpecifier: subject_specifier,
    subjectSpecifierMode: subject_specifier_mode,
    relation: relation,
    relationSpecifier: relation_specifier,
    relationSpecifierMode: relation_specifier_mode,
    comparison: comparison,
    comparisonValue: comparison_value
  }
end

def opening_game_conditions
  [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'allies', subject_specifier: 'rook', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 8),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'opponents', subject_specifier: 'queen', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'opponents', subject_specifier: 'rook', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'bishop', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'knight', relation: 'count', comparison: 'equal_to', comparison_value: 2),
    cond(subject: 'opponents', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 8),
    cond(subject: 'allies', relation: 'attacked', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', relation: 'attacked', comparison: 'equal_to', comparison_value: 0)
  ]
end

def endgame_gate_conditions
  [
    cond(subject: 'allies', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3)
  ]
end

cyclops_v2 = user.bots.find_or_initialize_by(name: 'Cyclops v2')
cyclops_v2.description = 'A behavior-preserving refactor target for Cyclops using shared graph trunks instead of repeated flat seed paths.'
cyclops_v2.save!

reset_bot_graph!(cyclops_v2)

cyclops_root = cyclops_v2.root_node

cyclops_terminal = create_organizer!(bot: cyclops_v2, position_x: 120, position_y: 4080, title: 'Terminal')
cyclops_opening = create_organizer!(bot: cyclops_v2, position_x: 780, position_y: 4080, title: 'Opening')
cyclops_tactics = create_organizer!(bot: cyclops_v2, position_x: 1600, position_y: 4080, title: 'Tactics')
cyclops_pressure = create_organizer!(bot: cyclops_v2, position_x: 2580, position_y: 4080, title: 'Pressure')
cyclops_endgame = create_organizer!(bot: cyclops_v2, position_x: 3840, position_y: 4080, title: 'Endgame')
cyclops_fallback = create_organizer!(bot: cyclops_v2, position_x: 4980, position_y: 4080, title: 'Fallback')

[cyclops_terminal, cyclops_opening, cyclops_tactics, cyclops_pressure, cyclops_endgame, cyclops_fallback].each do |organizer|
  connect!(cyclops_root, organizer)
end

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_terminal,
  x: 80,
  y: 4240,
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
  x: 340,
  y: 4240,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'opponents', relation: 'mobility', comparison: 'equal_to', comparison_value: 0),
    cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: -100
)

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_opening,
  x: 700,
  y: 4240,
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
      value: 9
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: 1520,
  y: 4240,
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
  bot: cyclops_v2,
  start_node: cyclops_tactics,
  x: 2040,
  y: 4240,
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
  x: 2300,
  y: 4240,
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
  x: 2560,
  y: 4240,
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
  x: 2820,
  y: 4240,
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
  base_x = 2480 + (index * 900)

  create_shared_split_paths!(
    bot: cyclops_v2,
    start_node: cyclops_pressure,
    x: base_x,
    y: 4240,
    zigzag_offset: 70,
    branch_spacing: 620,
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

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_pressure,
  x: 3720,
  y: 4240,
  zigzag_offset: 70,
  branch_spacing: 260,
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

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_endgame,
  x: 3780,
  y: 4240,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 88
)

create_path!(
  bot: cyclops_v2,
  start_node: cyclops_endgame,
  x: 4040,
  y: 4240,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions + [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 24
)

cyclops_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 4300 + (index * 940)

  create_shared_split_paths!(
    bot: cyclops_v2,
    start_node: cyclops_endgame,
    x: base_x,
    y: 4240,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: endgame_gate_conditions + safety_conditions,
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

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 4900,
  y: 4240,
  zigzag_offset: 70,
  branch_spacing: 260,
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
  x: 5680,
  y: 4240,
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
  x: 5940,
  y: 4240,
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

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 6200,
  y: 4240,
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

create_shared_split_paths!(
  bot: cyclops_v2,
  start_node: cyclops_fallback,
  x: 6720,
  y: 4240,
  zigzag_offset: 70,
  branch_spacing: 260,
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
  x: 7240,
  y: 4240,
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

cyclops_v2.compile_program!

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

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  branch_spacing: 480,
  shared_conditions: rogue_opening_base,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

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

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: rogue_queen_base,
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
      ],
      action_type: 'return',
      value: 80
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
      ],
      action_type: 'add',
      value: 14
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'bishop', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 'prior_board_state'),
        cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
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
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 12
    }
  ]
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

  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_pressure,
    x: base_x,
    y: 1480,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: rogue_tighten_core,
        action_type: 'return',
        value: 34
      },
      {
        conditions: rogue_drive_core,
        action_type: 'add',
        value: 12
      },
      {
        conditions: rogue_forcing_core,
        action_type: 'add',
        value: 16
      }
    ]
  )
end

rogue_shelter_break_shielder_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
]

rogue_shelter_break_coverer_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'adjacent', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 1)
]

rogue_tactical_strike_safety.each_with_index do |safety_conditions, index|
  base_x = 2940 + (index * 240)

  create_shared_path!(
    bot: rogue_v2,
    start_node: rogue_pressure,
    x: base_x,
    y: 2620,
    zigzag_offset: 70,
    shared_conditions: rogue_shelter_break_shielder_core + safety_conditions,
    action_type: 'return',
    value: 32
  )

  create_shared_path!(
    bot: rogue_v2,
    start_node: rogue_pressure,
    x: base_x,
    y: 3190,
    zigzag_offset: 70,
    shared_conditions: rogue_shelter_break_coverer_core + safety_conditions,
    action_type: 'return',
    value: 32
  )
end

rogue_endgame_base = endgame_gate_conditions

rogue_endgame_variants = [
  {
    conditions: [
      cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'return',
    value: 88
  },
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
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    action_type: 'return',
    value: 22
  },
  {
    conditions: [
      cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'return',
    value: 22
  },
  {
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 14
  },
  {
    conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 14
  },
  {
    conditions: rogue_tighten_core + rogue_pressure_safety[0],
    action_type: 'return',
    value: 32
  },
  {
    conditions: rogue_tighten_core + rogue_pressure_safety[1],
    action_type: 'return',
    value: 32
  },
  {
    conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  },
  {
    conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
      cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
    ],
    action_type: 'add',
    value: 8
  }
]

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_endgame,
  x: 3240,
  y: 1060,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: rogue_endgame_base,
  variants: rogue_endgame_variants
)

rogue_supported_activity_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
  cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
  cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
]

create_shared_split_paths!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 4460,
  y: 1440,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: rogue_supported_activity_base + [
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
  start_node: rogue_fallback,
  x: 5240,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
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

create_path!(
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 5760,
  y: 1440,
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
  bot: rogue_v2,
  start_node: rogue_fallback,
  x: 6020,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
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

[
  {
    piece_type: 'king',
    x: 6280,
    y: 1440
  },
  {
    piece_type: 'pawn',
    x: 6800,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_fallback,
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state'),
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

[
  {
    piece_type: 'king',
    x: 6800,
    y: 1440
  },
  {
    piece_type: 'pawn',
    x: 7320,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: rogue_v2,
    start_node: rogue_fallback,
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state'),
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

rogue_v2.compile_program!

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

storm_v2 = user.bots.find_or_initialize_by(name: 'Storm v2')
storm_v2.description = 'A behavior-preserving refactor target for Storm using shared graph trunks for the repeated opening, queen, endgame, and fallback families.'
storm_v2.save!

reset_bot_graph!(storm_v2)

storm_root = storm_v2.root_node

storm_terminal = create_organizer!(bot: storm_v2, position_x: 120, position_y: 120, title: 'Terminal')
storm_opening = create_organizer!(bot: storm_v2, position_x: 820, position_y: 120, title: 'Opening')
storm_tactics = create_organizer!(bot: storm_v2, position_x: 560, position_y: 1780, title: 'Tactics')
storm_queen = create_organizer!(bot: storm_v2, position_x: 1960, position_y: 220, title: 'Queen Strategy')
storm_pressure = create_organizer!(bot: storm_v2, position_x: 2200, position_y: 1320, title: 'King Pressure')
storm_endgame = create_organizer!(bot: storm_v2, position_x: 3240, position_y: 900, title: 'Endgame')
storm_fallback = create_organizer!(bot: storm_v2, position_x: 4380, position_y: 1280, title: 'Fallback')

[storm_terminal, storm_opening, storm_tactics, storm_queen, storm_pressure, storm_endgame, storm_fallback].each do |organizer|
  connect!(storm_root, organizer)
end

create_path!(
  bot: storm_v2,
  start_node: storm_terminal,
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
  bot: storm_v2,
  start_node: storm_terminal,
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

storm_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening,
  x: 700,
  y: 280,
  zigzag_offset: 80,
  conditions: opening_game_conditions
)

storm_knight_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 1180,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'knight', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_knight_opening_base,
  x: 1180,
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
      value: 12
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 12
    }
  ]
)

storm_bishop_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 1780,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_bishop_opening_base,
  x: 1780,
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
      value: 11
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 11
    }
  ]
)

storm_pawn_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_opening_base,
  x: 2380,
  y: 2380,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

storm_pawn_bishop_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_pawn_opening_base,
  x: 2380,
  y: 2530,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'bishop', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_pawn_bishop_opening_base,
  x: 2380,
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

storm_pawn_knight_opening_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_pawn_opening_base,
  x: 2900,
  y: 2530,
  zigzag_offset: 80,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'knight', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_pawn_knight_opening_base,
  x: 2900,
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

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_tactics,
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

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_tactics,
  x: 940,
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
  bot: storm_v2,
  start_node: storm_tactics,
  x: 680,
  y: 1940,
  zigzag_offset: 60,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'allies', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ],
  action_type: 'return',
  value: 92
)

create_path!(
  bot: storm_v2,
  start_node: storm_tactics,
  x: 1440,
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

storm_queen_base = [
  cond(subject: 'moved_piece', subject_specifier: 'queen', relation: 'count', comparison: 'greater_than', comparison_value: 0)
]

storm_queen_base_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen,
  x: 1820,
  y: 380,
  zigzag_offset: 70,
  conditions: storm_queen_base
)

storm_queen_safety_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 1820,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_safety_base,
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

storm_queen_coordination_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 2600,
  y: 530,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_coordination_base,
  x: 2600,
  y: 680,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 10
    },
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

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_queen_base_node,
  x: 3900,
  y: 530,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
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
    },
    {
      conditions: [
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacked', relation_specifier: 'moved_piece', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'captured_piece', relation: 'count', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'equal_to', comparison_value: 'prior_board_state')
      ],
      action_type: 'subtract',
      value: 12
    }
  ]
)

storm_pressure_safety = [
  [cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)],
  [cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)]
]

storm_tighten_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'mobility', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'attacker', comparison: 'greater_than', comparison_value: 'prior_board_state')
]

storm_strip_core = [
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'shielder', comparison: 'less_than', comparison_value: 'prior_board_state'),
  cond(subject: 'opponents', subject_specifier: 'king', relation: 'coverer', comparison: 'less_than', comparison_value: 'prior_board_state')
]

storm_pressure_safety.each_with_index do |safety_conditions, index|
  base_x = 2100 + (index * 900)

  create_shared_split_paths!(
    bot: storm_v2,
    start_node: storm_pressure,
    x: base_x,
    y: 1480,
    zigzag_offset: 70,
    branch_spacing: 620,
    shared_conditions: safety_conditions,
    variants: [
      {
        conditions: storm_tighten_core,
        action_type: 'return',
        value: 24
      },
      {
        conditions: storm_strip_core,
        action_type: 'return',
        value: 20
      }
    ]
  )
end

storm_endgame_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame,
  x: 3120,
  y: 1060,
  zigzag_offset: 70,
  conditions: endgame_gate_conditions
)

storm_endgame_capture_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 3120,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'captured_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'equal_to', comparison_value: 1)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_capture_base,
  x: 3120,
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

storm_endgame_pawn_move_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 3640,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_pawn_move_base,
  x: 3640,
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

storm_endgame_pawn_defended_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 4160,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_pawn_defended_base,
  x: 4160,
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

storm_endgame_attacked_less_base = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_endgame_base,
  x: 4680,
  y: 1360,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_endgame_attacked_less_base,
  x: 4680,
  y: 1510,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
  variants: [
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    },
    {
      conditions: [
        cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0),
        cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
      ],
      action_type: 'add',
      value: 8
    }
  ]
)

storm_queen_exclude_mobility_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 4260,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'queen', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'mobility', comparison: 'greater_than', comparison_value: 'prior_board_state')
  ]
)

storm_queen_exclude_mobility_defended_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_node,
  x: 4260,
  y: 1740,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'defender', comparison: 'greater_than', comparison_value: 0)
  ]
)

storm_supported_activity_safe_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 4260,
  y: 1890,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ]
)

create_shared_split_paths!(
  bot: storm_v2,
  start_node: storm_supported_activity_safe_node,
  x: 4260,
  y: 2040,
  zigzag_offset: 70,
  branch_spacing: 260,
  shared_conditions: [],
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
    }
  ]
)

create_shared_path!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 4780,
  y: 1890,
  zigzag_offset: 70,
  shared_conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'rook', relation: 'count', comparison: 'greater_than', comparison_value: 0),
    cond(subject: 'moved_piece', relation: 'attacker', relation_specifier: 'rook', comparison: 'greater_than', comparison_value: 0)
  ],
  action_type: 'add',
  value: 7
)

create_shared_path!(
  bot: storm_v2,
  start_node: storm_queen_exclude_mobility_defended_node,
  x: 5040,
  y: 1440,
  zigzag_offset: 70,
  shared_conditions: [
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 1)
  ],
  action_type: 'add',
  value: 5
)

storm_king_count_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 5300,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'king', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: storm_v2,
  start_node: storm_king_count_node,
  x: 5300,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'less_than', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'greater_than', comparison_value: 'prior_board_state'),
    cond(subject: 'moved_piece', relation: 'attacker', comparison: 'equal_to', comparison_value: 0)
  ],
  action_type: 'return',
  value: 26
)

create_path!(
  bot: storm_v2,
  start_node: storm_king_count_node,
  x: 7120,
  y: 1590,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'allies', subject_specifier: 'king', relation: 'attacker', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'adjacent', comparison: 'equal_to', comparison_value: 'prior_board_state'),
    cond(subject: 'allies', subject_specifier: 'king', relation: 'coverer', comparison: 'equal_to', comparison_value: 'prior_board_state')
  ],
  action_type: 'subtract',
  value: 10
)

storm_pawn_count_node = create_condition_chain!(
  bot: storm_v2,
  start_node: storm_fallback,
  x: 5560,
  y: 1440,
  zigzag_offset: 70,
  conditions: [
    cond(subject: 'moved_piece', subject_specifier: 'pawn', relation: 'count', comparison: 'greater_than', comparison_value: 0)
  ]
)

create_path!(
  bot: storm_v2,
  start_node: storm_pawn_count_node,
  x: 5560,
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
  bot: storm_v2,
  start_node: storm_pawn_count_node,
  x: 5820,
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

storm_fallback_pawn_defended_variants = [
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

[
  {
    start_node: storm_king_count_node,
    x: 6080,
    y: 1440
  },
  {
    start_node: storm_pawn_count_node,
    x: 6080,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: storm_v2,
    start_node: entry[:start_node],
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', subject_specifier: 'pawn', relation: 'defended', comparison: 'greater_than', comparison_value: 'prior_board_state')
    ],
    variants: storm_fallback_pawn_defended_variants
  )
end

storm_fallback_attacked_less_variants = [
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

[
  {
    start_node: storm_king_count_node,
    x: 6600,
    y: 1440
  },
  {
    start_node: storm_pawn_count_node,
    x: 6600,
    y: 2010
  }
].each do |entry|
  create_shared_split_paths!(
    bot: storm_v2,
    start_node: entry[:start_node],
    x: entry[:x],
    y: entry[:y],
    zigzag_offset: 70,
    branch_spacing: 260,
    shared_conditions: [
      cond(subject: 'allies', relation: 'attacked', comparison: 'less_than', comparison_value: 'prior_board_state')
    ],
    variants: storm_fallback_attacked_less_variants
  )
end

storm_v2.compile_program!
