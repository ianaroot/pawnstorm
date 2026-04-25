module ApplicationHelper
  # Node dimensions lookup - must match the editor canvas dimensions.
  NODE_DIMENSIONS = {
    'condition' => { width: 100, height: 128 },
    'score' => { width: 108, height: 108 },
    'root' => { width: 120, height: 120 },
    'organizer' => { width: 140, height: 112 }
  }.freeze

  BOT_GUIDE_INLINE_TERMS = [
    'Current Condition',
    'Prior Board State',
    'Enemy Captured Piece Value',
    'Enemy Moved Piece Value',
    'Captured Piece Value',
    'Moved Piece Value',
    'Enemy Captured Piece',
    'Enemy Moved Piece',
    'Captured Piece',
    'Moved Piece',
    'Same-Piece',
    'Target filter',
    'Subject',
    'Filter',
    'Operator',
    'Target',
    'Comparison',
    'Template',
    'Score',
    'Return',
    'Cover'
  ].sort_by { |term| -term.length }.freeze

  BOT_GUIDE_INLINE_TERM_PATTERN = Regexp.union(
    BOT_GUIDE_INLINE_TERMS.map { |term| ERB::Util.html_escape(term) }
  )

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

    formatted.gsub!(BOT_GUIDE_INLINE_TERM_PATTERN) do |term|
      %(<span class="bot-guide-inline-key">#{term}</span>)
    end

    formatted.html_safe
  end
end
