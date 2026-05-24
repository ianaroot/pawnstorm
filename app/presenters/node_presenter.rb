class NodePresenter
  # Ordered content-chunk descriptors per condition kind: which payload field
  # feeds each chunk field. Spacers are inserted by the interpreter, not here.
  # Census is the one variant case (region vs whole), keyed off positionAxis
  # presence in the interpreter — never branched in this data.
  SENTENCE_SPEC = {
    'relational' => [
      { 'role' => 'side', 'fields' => {
        'subject' => 'subject', 'filter' => 'subjectFilter', 'filter_mode' => 'subjectFilterMode',
        'comparison_metric' => 'subjectComparisonMetric', 'comparator' => 'subjectComparator',
        'comparison_source' => 'subjectComparisonSource', 'comparison_source_total' => 'subjectComparisonSourceTotal' } },
      { 'role' => 'operator', 'fields' => { 'operator' => 'operator' } },
      { 'role' => 'side', 'fields' => {
        'subject' => 'target', 'filter' => 'targetFilter', 'filter_mode' => 'targetFilterMode',
        'comparison_metric' => 'targetComparisonMetric', 'comparator' => 'targetComparator',
        'comparison_source' => 'targetComparisonSource', 'comparison_source_total' => 'targetComparisonSourceTotal' } }
    ],
    'identity' => [
      { 'role' => 'side', 'fields' => { 'subject' => 'subject', 'filter' => 'subjectFilter', 'filter_mode' => 'subjectFilterMode' } },
      { 'role' => 'operator', 'consts' => { 'operator' => 'same_piece' } },
      { 'role' => 'side', 'fields' => { 'subject' => 'target' } }
    ],
    'census' => {
      'variant_by' => 'position_axis_present',
      'whole' => [
        { 'role' => 'side', 'fields' => {
          'subject' => 'subject', 'filter' => 'subjectFilter', 'filter_mode' => 'subjectFilterMode' } },
        { 'role' => 'operator', 'fields' => { 'operator' => 'operator' } },
        { 'role' => 'comparison', 'fields' => {
          'comparator' => 'comparator', 'target' => 'target', 'target_filter' => 'targetFilter',
          'target_filter_mode' => 'targetFilterMode', 'target_total' => 'targetTotal' } }
      ],
      'region' => [
        { 'role' => 'side', 'fields' => {
          'subject' => 'subject', 'filter' => 'subjectFilter', 'filter_mode' => 'subjectFilterMode' } },
        { 'role' => 'region', 'fields' => {
          'position_axis' => 'positionAxis', 'position_comparator' => 'positionComparator',
          'position_target' => 'positionTarget' } },
        { 'role' => 'metric', 'fields' => {
          'operator' => 'operator', 'comparator' => 'comparator', 'target' => 'target', 'target_total' => 'targetTotal' } }
      ]
    }
  }.freeze

  # Canonical chunk-field set per role; unmapped fields stay nil so output
  # shape is stable regardless of which kind produced the chunk.
  ROLE_KEYS = {
    'side' => %w[subject filter filter_mode comparison_metric comparator comparison_source comparison_source_total],
    'operator' => %w[operator],
    'comparison' => %w[comparator target target_filter target_filter_mode target_total],
    'region' => %w[position_axis position_comparator position_target],
    'metric' => %w[operator comparator target target_total]
  }.freeze

  def self.sentence_spec
    SENTENCE_SPEC
  end

  def initialize(node)
    @node = node
  end

  def condition_preview_chunks
    self.class.condition_preview_chunks_for(data)
  end

  def action_type
    data[:actionType] || data[:action_type] || 'add'
  end

  def action_value
    data[:value] || 1
  end

  def organizer_title
    data[:title].presence || 'Organizer'
  end

  def organizer_notes
    data[:notes].to_s
  end

  def self.condition_preview_chunks_for(data)
    return ['[invalid condition]'] unless data.is_a?(Hash)

    condition_preview_chunks_v2(data)
  end

  def self.condition_preview_chunks_v2(data)
    spec = SENTENCE_SPEC[data['kind'] || data[:kind]]
    return ['[invalid condition]'] unless spec

    descriptors = spec.is_a?(Array) ? spec : census_descriptors(spec, data)
    descriptors.each_with_index.flat_map do |descriptor, index|
      chunk = build_sentence_chunk(descriptor, data)
      index.zero? ? [chunk] : [{ role: 'spacer' }, chunk]
    end
  end

  # The one variant case: positionAxis presence selects region vs whole.
  def self.census_descriptors(spec, data)
    (data['positionAxis'] || data[:positionAxis]).present? ? spec['region'] : spec['whole']
  end

  def self.build_sentence_chunk(descriptor, data)
    fields = descriptor['fields'] || {}
    consts = descriptor['consts'] || {}
    chunk = { role: descriptor['role'] }
    ROLE_KEYS.fetch(descriptor['role']).each do |key|
      chunk[key.to_sym] =
        if consts.key?(key) then consts[key]
        elsif fields.key?(key) then data[fields[key]]
        end
    end
    chunk
  end

  private

  attr_reader :node

  def data
    @data ||= begin
      raw_data = node.data.is_a?(Hash) ? node.data : (JSON.parse(node.data) rescue {})
      raw_data.respond_to?(:with_indifferent_access) ? raw_data.with_indifferent_access : raw_data
    end
  end
end
