class NodePresenter
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
    kind = data['kind'] || data[:kind]
    case kind
    when 'relational'
      condition_preview_chunks_v2_relational(data)
    when 'unary'
      condition_preview_chunks_v2_unary(data)
    else
      ['[invalid condition]']
    end
  end

  def self.condition_preview_chunks_v2_relational(data)
    [
      v2_side_chunk(
        subject: data['subject'],
        filter: data['subjectFilter'],
        filter_mode: data['subjectFilterMode'],
        comparison_metric: data['subjectComparisonMetric'],
        comparator: data['subjectComparator'],
        comparison_source: data['subjectComparisonSource'],
        comparison_source_total: data['subjectComparisonSourceTotal']
      ),
      { role: 'spacer' },
      { role: 'operator', operator: data['operator'] },
      { role: 'spacer' },
      v2_side_chunk(
        subject: data['target'],
        filter: data['targetFilter'],
        filter_mode: data['targetFilterMode'],
        comparison_metric: data['targetComparisonMetric'],
        comparator: data['targetComparator'],
        comparison_source: data['targetComparisonSource'],
        comparison_source_total: data['targetComparisonSourceTotal']
      )
    ]
  end

  def self.condition_preview_chunks_v2_unary(data)
    [
      v2_side_chunk(
        subject: data['subject'],
        filter: data['subjectFilter'],
        filter_mode: data['subjectFilterMode']
      ),
      { role: 'spacer' },
      { role: 'operator', operator: data['operator'] },
      { role: 'spacer' },
      {
        role: 'comparison',
        comparator: data['comparator'],
        target: data['target'],
        target_filter: data['targetFilter'],
        target_filter_mode: data['targetFilterMode'],
        target_total: data['targetTotal']
      }
    ]
  end

  def self.v2_side_chunk(subject:, filter:, filter_mode:, comparison_metric: nil, comparator: nil, comparison_source: nil, comparison_source_total: nil)
    {
      role: 'side',
      subject: subject,
      filter: filter,
      filter_mode: filter_mode,
      comparison_metric: comparison_metric,
      comparator: comparator,
      comparison_source: comparison_source,
      comparison_source_total: comparison_source_total
    }
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
