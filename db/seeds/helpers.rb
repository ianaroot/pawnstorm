def seed_user!
  seed_email = ENV.fetch('SEED_USER_EMAIL', 'ianaroot@gmail.com')
  seed_password = ENV.fetch('SEED_USER_PASSWORD', 'password123')

  user = User.find_or_initialize_by(email: seed_email)
  if user.new_record?
    user.password = seed_password
    user.password_confirmation = seed_password
  end
  user.save!
  user
end

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

def unary_v2(subject:, operator:, comparator:, comparison_value:, filter: 'any', filter_mode: 'include')
  data = {
    version: 2,
    kind: 'unary',
    subject: subject,
    subjectFilter: filter,
    operator: operator,
    comparator: comparator,
    comparisonValue: comparison_value
  }

  data[:subjectFilterMode] = filter_mode unless filter == 'any'
  data
end

def rel_v2(
  subject:,
  operator:,
  target:,
  subject_filter: 'any',
  subject_filter_mode: 'include',
  target_filter: 'any',
  target_filter_mode: 'include',
  subject_comparison_metric: nil,
  subject_comparator: nil,
  subject_comparison_value: nil,
  target_comparison_metric: nil,
  target_comparator: nil,
  target_comparison_value: nil
)
  data = {
    version: 2,
    kind: 'relational',
    subject: subject,
    subjectFilter: subject_filter,
    operator: operator,
    target: target,
    targetFilter: target_filter
  }

  data[:subjectFilterMode] = subject_filter_mode unless subject_filter == 'any'
  data[:targetFilterMode] = target_filter_mode unless target_filter == 'any'

  if subject_comparison_metric.present?
    data[:subjectComparisonMetric] = subject_comparison_metric
    data[:subjectComparator] = subject_comparator
    data[:subjectComparisonValue] = subject_comparison_value
  end

  if target_comparison_metric.present?
    data[:targetComparisonMetric] = target_comparison_metric
    data[:targetComparator] = target_comparator
    data[:targetComparisonValue] = target_comparison_value
  end

  data
end

def opening_game_conditions_v2
  [
    unary_v2(subject: 'allied', filter: 'king', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'allied', filter: 'queen', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'allied', filter: 'rook', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'allied', filter: 'bishop', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'allied', filter: 'knight', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'allied', filter: 'pawn', operator: 'count', comparator: 'equal_to', comparison_value: 8),
    unary_v2(subject: 'enemy', filter: 'king', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'enemy', filter: 'queen', operator: 'count', comparator: 'equal_to', comparison_value: 1),
    unary_v2(subject: 'enemy', filter: 'rook', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'enemy', filter: 'bishop', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'enemy', filter: 'knight', operator: 'count', comparator: 'equal_to', comparison_value: 2),
    unary_v2(subject: 'enemy', filter: 'pawn', operator: 'count', comparator: 'equal_to', comparison_value: 8)
  ]
end

def endgame_gate_conditions_v2
  [
    unary_v2(subject: 'allied', filter: 'pawn', filter_mode: 'exclude', operator: 'count', comparator: 'less_than', comparison_value: 3),
    unary_v2(subject: 'enemy', filter: 'pawn', filter_mode: 'exclude', operator: 'count', comparator: 'less_than', comparison_value: 3)
  ]
end
