module ApplicationHelper
  # Node dimensions lookup - must match Traverser::NODE_DIMENSIONS
  NODE_DIMENSIONS = {
    'condition' => { width: 100, height: 60 },
    'action' => { width: 100, height: 60 },
    'root' => { width: 120, height: 120 },
    'organizer' => { width: 40, height: 40 }
  }.freeze

  # Calculate connector positions for a node
  # Returns hash with CSS custom property values
  def node_connector_styles(node)
    dims = NODE_DIMENSIONS.fetch(node.node_type, { width: 100, height: 60 })
    width = dims[:width]
    height = dims[:height]
    
    # Connector dots are 14px, center point is offset by 7px
    {
      '--connector-input-x' => "#{width / 2}px",
      '--connector-input-y' => '0px',
      '--connector-output-x' => "#{width / 2}px",
      '--connector-output-y' => '0px',
      'width' => "#{width}px",
      'min-height' => "#{height}px"
    }
  end

  def bot_guide_structured_snippet?(body)
    lines = body.to_s.lines.map(&:strip).reject(&:empty?)
    return false if lines.empty?

    lines.all? { |line| line.match?(/\A[^:]+:\s+.+\z/) }
  end

  def bot_guide_snippet_rows(body)
    body.to_s.lines.map(&:strip).reject(&:empty?).filter_map do |line|
      key, value = line.split(':', 2)
      next if key.blank? || value.blank?

      {
        key: "#{key.strip}:",
        value: value.strip
      }
    end
  end

  def format_bot_guide_text(text)
    return '' if text.blank?

    formatted = ERB::Util.html_escape(text)

    [
      'Subject',
      'Subject specifier',
      'Relation',
      'Relation specifier',
      'Comparison',
      'Comparison value'
    ].each do |term|
      escaped_term = ERB::Util.html_escape(term)
      replacement = %(<span class="bot-guide-inline-key">#{escaped_term}</span>)
      formatted = formatted.gsub(escaped_term, replacement)
    end

    formatted.html_safe
  end
end
