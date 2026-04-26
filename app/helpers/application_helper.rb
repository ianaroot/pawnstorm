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

  def sidebar_tips_for_page
    case [controller_name, action_name]
    when ['bots', 'edit']
      bot_editor_sidebar_tips
    when ['matches', 'show']
      match_replay_sidebar_tips
    else
      []
    end
  end

  def bot_editor_sidebar_tips
    [
      {
        eyebrow: 'Editor Tip',
        title: 'Inspect node previews',
        body: 'Press I to toggle node hover previews.',
        accent: 'violet',
        image: {
          kind: :keyboard_hint,
          data: {
            label: 'Inspect mode',
            keys: ['I']
          }
        }
      },
      {
        eyebrow: 'Editor Tip',
        title: 'Pan the canvas',
        body: 'Hold Space and drag to pan the graph.',
        accent: 'teal',
        image: {
          kind: :drag_gesture,
          data: {
            label: 'Pan view',
            modifier: 'Space',
            mode: 'pan'
          }
        }
      },
      {
        eyebrow: 'Editor Tip',
        title: 'Build a bigger selection',
        body: 'Drag empty canvas to select, then Shift-click to add more.',
        accent: 'gold',
        image: {
          kind: :drag_gesture,
          data: {
            label: 'Select nodes',
            modifier: 'Shift',
            mode: 'select'
          }
        }
      },
      {
        eyebrow: 'Editor Tip',
        title: 'Move one node precisely',
        body: 'Alt-drag to move only the grabbed node.',
        accent: 'blue',
        image: {
          kind: :drag_gesture,
          data: {
            label: 'Move one node',
            modifier: 'Alt',
            mode: 'isolate'
          }
        }
      }
    ]
  end

  def match_replay_sidebar_tips
    [
      {
        eyebrow: 'Replay Tip',
        title: 'Inspect moves',
        body: "Pause replay, click a piece, then click a legal destination to see how the bot evaluated that move.",
        accent: 'blue',
        image: {
          kind: :mini_board,
          data: {
            rows: [
              %w[empty candidate empty empty],
              ['candidate', 'selected:pawn', 'candidate', 'empty'],
              %w[empty empty played empty],
              %w[inspected empty empty empty]
            ]
          }
        }
      },
      {
        eyebrow: 'Replay Tip',
        title: 'Jump by notation',
        body: 'Click move notation to jump straight to that turn.',
        accent: 'gold',
        image: {
          kind: :notation_list,
          data: {
            rows: ['1. e4 e5', '2. Nf3 Nc6', '3. Bb5 a6'],
            active_index: 1
          }
        }
      },
      {
        eyebrow: 'Replay Tip',
        title: 'Read the highlights',
        body: 'Purple is the played move. Blue is the inspected move.',
        accent: 'teal',
        image: {
          kind: :mini_board,
          data: {
            rows: [
              %w[empty empty empty empty],
              ['empty', 'selected:pawn', 'empty', 'empty'],
              %w[played empty empty empty],
              %w[empty empty inspected empty]
            ]
          }
        }
      }
    ]
  end
end
