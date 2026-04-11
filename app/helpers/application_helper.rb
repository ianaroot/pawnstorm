module ApplicationHelper
  # Node dimensions lookup - must match the editor canvas dimensions.
  NODE_DIMENSIONS = {
    'condition' => { width: 100, height: 128 },
    'action' => { width: 108, height: 108 },
    'root' => { width: 120, height: 120 },
    'organizer' => { width: 140, height: 112 }
  }.freeze

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
