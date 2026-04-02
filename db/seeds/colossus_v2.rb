# Standalone seed file for Colossus v2.

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

def endgame_gate_conditions
  [
    cond(subject: 'allies', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3),
    cond(subject: 'opponents', subject_specifier: 'pawn', subject_specifier_mode: 'exclude', relation: 'count', comparison: 'less_than', comparison_value: 3)
  ]
end

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
