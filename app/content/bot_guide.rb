class BotGuide
  class << self
    def sections
      [
        what_your_bot_does,
        how_the_graph_is_read,
        how_scoring_works
      ]
    end

    private

    def what_your_bot_does
      {
        id: 'what-your-bot-does',
        title: 'What Your Bot Does',
        examples: [
          {
            title: 'The scoring loop',
            explanation: 'Think of each turn as the same short loop repeated for every legal move.',
            snippets: [
              {
                label: 'Bot Turn',
                body: <<~TEXT.strip
                  1. Pick one legal move to inspect
                  2. Walk through the graph from the root
                  3. Apply actions from branches whose conditions pass
                  4. Repeat for every legal move
                  5. Play one of the highest-scoring moves
                TEXT
              }
            ]
          }
        ]
      }
    end

    def how_the_graph_is_read
      {
        id: 'how-the-graph-is-read',
        title: 'How The Graph Is Read',
        intro: 'Graph order matters. Pawnstorm reads your graph depth first. If a node has more than one child, their order is decided by where they sit around the parent.',
        visual: {
          kind: 'mini_graph',
          title: 'Branch Order Example',
          caption: 'Pawnstorm reads child branches counter-clockwise from midnight around the parent. It follows each branch depth first before returning to the next sibling.'
        }
      }
    end

    def how_scoring_works
      {
        id: 'how-scoring-works',
        title: 'How Scoring Works',
        intro: 'Score nodes change the score of the move currently being tested. A condition decides whether the branch reaches the score node; the score node decides how much the move score changes.',
        bullets: [
          'Add increases the current score.',
          'Subtract decreases the current score.',
          'Set replaces the current score with a new number.',
          'Return sets the score and immediately stops reading the rest of the graph for that move.',
          'Use small Add/Subtract values for preferences and larger Return values for decisive patterns.'
        ]
      }
    end
  end
end
