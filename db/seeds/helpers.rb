require 'json'

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

def create_score!(bot:, position_x:, position_y:, action_type:, value:)
  bot.nodes.create!(
    node_type: 'score',
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

def seed_template_library
  @seed_template_library ||= JSON.parse(File.read(File.expand_path('template_library.json', __dir__))).index_by { |template| template.fetch('id') }
end

def seed_template!(template_id)
  seed_template_library.fetch(template_id) do
    raise KeyError, "Unknown seed template #{template_id.inspect}"
  end
end

def create_template_instance!(
  bot:,
  start_node:,
  template_id:,
  x:,
  y:,
  title: nil,
  notes: nil,
  action_value_multiplier: 1,
  action_value_overrides: {}
)
  template = seed_template!(template_id)
  node_map = {}

  template.fetch('nodes').each do |template_node|
    data = template_node.fetch('data').deep_dup
    if template_node.fetch('type') == 'organizer'
      data['title'] = title if title
      data['notes'] = notes if notes
    elsif template_node.fetch('type') == 'score'
      action_key = template_node.fetch('key')
      data['value'] = action_value_overrides.fetch(action_key, scaled_action_value(data.fetch('value'), action_value_multiplier))
    end

    position = template_node.fetch('position')
    node_map[template_node.fetch('key')] = bot.nodes.create!(
      node_type: template_node.fetch('type'),
      position_x: x + position.fetch('x'),
      position_y: y + position.fetch('y'),
      data: data
    )
  end

  template.fetch('connections').each do |connection|
    connect!(node_map.fetch(connection.fetch('source')), node_map.fetch(connection.fetch('target')))
  end

  connect!(start_node, node_map.fetch('organizer'))
  node_map
end

def create_template_instances!(bot:, start_node:, placements:)
  placements.each do |placement|
    create_template_instance!(
      bot: bot,
      start_node: start_node,
      **placement
    )
  end
end

def scaled_action_value(value, multiplier)
  (value * multiplier).round
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

  action_node = create_score!(
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

    action_node = create_score!(
      bot: bot,
      position_x: action_x,
      position_y: y + ((shared_depth + variant.fetch(:conditions).length) * step_y),
      action_type: variant.fetch(:score_type),
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

def unary_v2(
  subject:,
  operator:,
  comparator:,
  comparison_value: nil,
  filter: 'any',
  filter_mode: 'include',
  target: nil,
  target_filter: 'any',
  target_filter_mode: 'include',
  target_total: nil
)
  data = {
    version: 2,
    kind: 'unary',
    subject: subject,
    subjectFilter: filter,
    operator: operator,
    comparator: comparator
  }

  data[:subjectFilterMode] = filter_mode unless filter == 'any'
  apply_unary_target!(
    data,
    target: target,
    target_filter: target_filter,
    target_filter_mode: target_filter_mode,
    target_total: target_total,
    comparison_value: comparison_value
  )
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
  target_comparison_value: nil,
  subject_comparison_source: nil,
  subject_comparison_source_total: nil,
  target_comparison_source: nil,
  target_comparison_source_total: nil
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
    apply_relational_comparison_source!(
      data,
      prefix: :subject,
      source: subject_comparison_source,
      source_total: subject_comparison_source_total,
      comparison_value: subject_comparison_value
    )
  end

  if target_comparison_metric.present?
    data[:targetComparisonMetric] = target_comparison_metric
    data[:targetComparator] = target_comparator
    apply_relational_comparison_source!(
      data,
      prefix: :target,
      source: target_comparison_source,
      source_total: target_comparison_source_total,
      comparison_value: target_comparison_value
    )
  end

  data
end

def apply_unary_target!(data, target:, target_filter:, target_filter_mode:, target_total:, comparison_value:)
  resolved_target, resolved_total = comparison_source_from_value(target || comparison_value, explicit_total: target_total)

  data[:target] = resolved_target

  if resolved_target == 'exact_number'
    data[:targetTotal] = resolved_total
  elsif resolved_target != 'prior_board_state'
    data[:targetFilter] = target_filter
    data[:targetFilterMode] = target_filter_mode unless target_filter == 'any'
  end
end

def apply_relational_comparison_source!(data, prefix:, source:, source_total:, comparison_value:)
  resolved_source, resolved_total = comparison_source_from_value(source || comparison_value, explicit_total: source_total)
  source_key = "#{prefix}ComparisonSource".to_sym
  source_total_key = "#{prefix}ComparisonSourceTotal".to_sym

  data[source_key] = resolved_source
  data[source_total_key] = resolved_total if resolved_source == 'exact_number'
end

def comparison_source_from_value(value, explicit_total:)
  if value == 'exact_number'
    raise ArgumentError, 'exact_number comparison source requires a numeric total' unless explicit_total.is_a?(Numeric)

    return ['exact_number', explicit_total]
  end

  return ['prior_board_state', nil] if value == 'prior_board_state'
  return [value.to_s.delete_suffix('_value'), nil] if value.is_a?(String)

  raise ArgumentError, 'exact_number comparison source requires a numeric value' unless value.is_a?(Numeric)

  ['exact_number', value]
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
