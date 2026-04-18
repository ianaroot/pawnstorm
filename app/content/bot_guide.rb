class BotGuide
  class << self
    def title
      'Build a Chess Bot'
    end

    def intro
      'Pawnstorm bots score chess moves. On each turn, your bot checks every legal move, walks through your graph for that move, changes the move score when conditions match, and then plays one of the highest-scoring moves.'
    end

    def drawer_intro
      'Use this while you build. Focus on how to read condition nodes, how branch order works, and how replay shows why a move scored the way it did.'
    end

    def sections
      [
        what_your_bot_does,
        start_with_a_template,
        how_the_graph_is_read,
        node_types,
        how_to_read_conditions,
        what_cover_means,
        condition_examples,
        how_scoring_works,
        test_and_inspect_matches
      ]
    end

    private

    def what_your_bot_does
      {
        id: 'what-your-bot-does',
        title: 'What Your Bot Does',
        intro: 'Your bot is not searching many turns ahead. It is judging one legal move at a time. The graph describes what your bot notices about that candidate move and how much that should change the score.',
        bullets: [
          'The root node is the starting point for every move your bot considers.',
          'Condition nodes ask yes/no questions about the move being tested.',
          'Action nodes add, subtract, set, or return a score for that move.',
          'Organizer nodes are labels and notes for you. They help structure a graph but do not affect scoring.',
          'After every legal move has been scored, Pawnstorm chooses randomly from the highest-scoring moves.'
        ],
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

    def start_with_a_template
      {
        id: 'start-with-a-template',
        title: 'Start With A Template',
        intro: 'Templates are prebuilt chunks for common ideas like rewarding captures, avoiding unsafe squares, developing pieces, and recognizing tactics. They are a fast way to see working graph patterns, but the goal is to understand the nodes well enough to make your own.',
        bullets: [
          'Use Templates when you want a working example on the canvas.',
          'Read the inserted nodes from top to bottom before changing them.',
          'Change one condition or score at a time, then compile and test.',
          'Templates are starting points, not special rules. Once inserted, they are normal nodes in your graph.'
        ],
        examples: [
          {
            title: 'A useful first loop',
            explanation: 'For a first bot, keep the feedback cycle small. Insert a simple template, run a match, inspect one move in replay, then edit one condition or action.',
            snippets: [
              {
                label: 'First Build Pass',
                body: <<~TEXT.strip
                  Insert: Any Capture or Winning Capture
                  Compile: save the graph into a runnable bot
                  Test: run a match
                  Inspect: pause replay on one move
                  Adjust: change one score or condition
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
          caption: 'Pawnstorm starts at the root, checks the child closest to straight down first, then moves counter-clockwise. It follows each branch depth first before returning to the next sibling.'
        },
        bullets: [
          'Pawnstorm starts at the root node.',
          'It walks depth first, which means it follows a branch downward before it comes back and tries the next sibling branch.',
          'If a parent has several children, child precedence is determined counter-clockwise, starting from straight down from the parent.',
          'Layout is not only visual. Node position can change evaluation order.'
        ],
        examples: [
          {
            title: 'Child precedence rule',
            explanation: 'When several children come out of the same parent, the first child checked is the one closest to straight down. Then Pawnstorm moves counter-clockwise around the parent.',
            snippets: [
              {
                label: 'Order Rule',
                body: <<~TEXT.strip
                  Start at straight down
                  Move counter-clockwise
                  Read branches depth first
                  Earlier branches get checked first
                TEXT
              }
            ]
          }
        ]
      }
    end

    def node_types
      {
        id: 'node-types',
        title: 'Node Types',
        intro: 'A bot graph is built from a few node types. The root starts evaluation, conditions decide whether a branch continues, actions change the score, and organizers keep the canvas understandable.',
        visual: {
          kind: 'node_pair',
          title: 'What These Nodes Look Like',
          caption: 'A condition reads like a small sentence. An action changes the score for the move currently being tested.',
          cards: [
            {
              type: 'condition',
              title: 'Condition node',
              preview: "Captured Piece\nvalue > Moved Piece Value",
              note: 'A yes/no question about the move being tested'
            },
            {
              type: 'action',
              title: 'Action node',
              preview: "Return\n100",
              note: 'Changes or finalizes the score for that move'
            }
          ]
        },
        bullets: [
          'Root is where every candidate move starts.',
          'Condition lets the branch continue only when its question is true.',
          'Action changes the current move score.',
          'Organizer gives a branch a title or notes. It does not compile into scoring behavior.'
        ]
      }
    end

    def how_to_read_conditions
      {
        id: 'how-to-read-conditions',
        title: 'How To Read Conditions',
        intro: 'The editor builds a condition from left to right: Subject, Operator, then Target or Comparison. The Current Condition line shows the sentence your node will use.',
        bullets: [
          'Subject is the piece or group the condition starts from: Allied, Enemy, Moved Piece, Captured Piece, Enemy Moved Piece, or Enemy Captured Piece.',
          'Filter narrows a subject to Any, King, Queen, Rook, Bishop, Knight, Pawn, or Non- plus one of those piece types.',
          'Operator is what the condition checks: attack, defend, cover, shield, adjacent, same-piece, count, mobility, or value.',
          'Attack and defend use controlled squares on the current board. Mobility uses legal moves.',
          'Target appears for relationship operators like attack or defend.',
          'Comparison appears for measurement operators like count, mobility, and value.',
          'For relationship operators, + comparison can restrict the matching subject or target by count or value.'
        ],
        examples: [
          {
            title: 'Two condition shapes',
            explanation: 'Unary conditions measure one side. Relational conditions ask whether one side has a relationship to another side.',
            snippets: [
              {
                label: 'Unary Condition',
                kind: 'condition_editor',
                subject: { subject: 'Moved Piece', filter: 'Knight' },
                operator: 'Mobility',
                comparison: { comparator: '>', value: 'Prior Board State' },
                preview: 'Moved Piece knight : mobility : > Prior Board State'
              },
              {
                label: 'Relational Condition',
                kind: 'condition_editor',
                subject: { subject: 'Enemy', filter: 'Pawn' },
                operator: 'Attack',
                target: { subject: 'Moved Piece', filter: 'Any' },
                preview: 'Enemy pawn : attack : Moved Piece'
              }
            ]
          }
        ]
      }
    end

    def condition_examples
      {
        id: 'condition-examples',
        title: 'Condition Examples',
        intro: 'The easiest way to learn condition nodes is to translate a chess idea into the fields the editor shows. Start with the plain-English goal, then build the condition sentence.',
        bullets: [
          'Use these examples as patterns you can borrow and remix.',
          'The plain-English line is what the node means.',
          'The editor block shows the V2 condition shape to build.'
        ],
        examples: [
          capture_example,
          winning_capture_example,
          pawn_attack_example,
          pawn_mobility_example,
          defended_rook_example,
          cover_example,
          double_attack_example,
          same_piece_example
        ]
      }
    end

    def what_cover_means
      {
        id: 'what-cover-means',
        title: 'What Cover Means',
        intro: 'Cover is easy to misread because it is not the same as defend or shield. A piece covers another allied piece when it is the first allied blocker on a ray from that piece, and an enemy rook, bishop, or queen has the right movement type to threaten the far side of that ray.',
        visual: {
          kind: 'cover_boards',
          title: 'Cover Needs Slider Geometry To The Far Side',
          caption: 'The covering piece is the blocker. The covered piece is the ally behind it. The slider does not have to sit on the same ray already, and it does not need a legal move there right now.',
          boards: [
            {
              title: 'Counts as cover',
              caption: 'The white pawn on d5 covers the white rook on d4 because a rook on g8 could geometrically attack the far side of the d-file. The black pawn in its way does not matter for cover.',
              pieces: {
                'e1' => { glyph: '♔', tone: 'white' },
                'd4' => { glyph: '♖', tone: 'white' },
                'd5' => { glyph: '♙', tone: 'white' },
                'f8' => { glyph: '♟', tone: 'black' },
                'g8' => { glyph: '♜', tone: 'black' },
                'a8' => { glyph: '♚', tone: 'black' }
              },
              states: {
                'd4' => 'covered',
                'd5' => 'coverer',
                'd6' => 'ray',
                'd7' => 'ray',
                'e8' => 'slider-route',
                'f8' => 'route-blocker',
                'g8' => 'slider'
              }
            },
            {
              title: 'Does not count',
              caption: 'The pawn is in front of the rook, and there are enemy sliders nearby, but neither has geometry to the far side of the d-file. This is not cover.',
              pieces: {
                'e1' => { glyph: '♔', tone: 'white' },
                'd4' => { glyph: '♖', tone: 'white' },
                'd5' => { glyph: '♙', tone: 'white' },
                'g5' => { glyph: '♜', tone: 'black' },
                'g6' => { glyph: '♝', tone: 'black' },
                'h8' => { glyph: '♚', tone: 'black' }
              },
              states: {
                'd4' => 'covered-muted',
                'd5' => 'coverer-muted',
                'd6' => 'empty-ray',
                'd7' => 'empty-ray',
                'd8' => 'empty-ray',
                'g5' => 'slider-muted',
                'g6' => 'slider-muted'
              }
            },
            {
              title: 'Diagonal cover counts too',
              caption: 'The white pawn on b2 covers the rook on a1 because a bishop on e7 could geometrically attack the far side of that diagonal.',
              pieces: {
                'e1' => { glyph: '♔', tone: 'white' },
                'a1' => { glyph: '♖', tone: 'white' },
                'b2' => { glyph: '♙', tone: 'white' },
                'e7' => { glyph: '♝', tone: 'black' },
                'h8' => { glyph: '♚', tone: 'black' }
              },
              states: {
                'a1' => 'covered',
                'b2' => 'coverer',
                'c3' => 'ray',
                'd4' => 'ray',
                'e5' => 'ray',
                'e7' => 'slider'
              }
            }
          ]
        },
        bullets: [
          'Cover is directional: the subject is the covering blocker, and the target is the allied piece being covered.',
          'Enemy slider pressure means a rook, bishop, or queen has the movement geometry to attack a square past the blocker on the same ray from the covered piece.',
          'Cover does not require that slider to have a legal move to the far-side square right now.',
          'A nearby piece is not covered just because another ally is in front of it. Without enemy slider geometry to the far side, cover is false.',
          'Shield is stricter than cover: the enemy slider must already be sitting on the ray with exactly one allied blocker between it and the shielded piece.',
          'Use cover when you want to notice pins, shields, and pieces that stand between a threat and something valuable.'
        ],
        examples: [
          cover_example
        ]
      }
    end

    def capture_example
      {
        title: 'Example 1: Is this move a capture?',
        explanation: 'Goal: reward moves that capture something.',
        snippets: [
          {
            label: 'Plain English',
            body: '"Does this move capture a piece?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Captured Piece', filter: 'Any' },
            operator: 'Count',
            comparison: { comparator: '>', value: '0' },
            preview: 'Captured Piece : count : > 0'
          }
        ]
      }
    end

    def winning_capture_example
      {
        title: 'Example 2: Does this move win material?',
        explanation: 'Goal: reward captures where the captured piece is worth more than the moving piece.',
        snippets: [
          {
            label: 'Plain English',
            body: '"Is the captured piece worth more than the piece I moved?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Captured Piece', filter: 'Any' },
            operator: 'Value',
            comparison: { comparator: '>', value: 'Moved Piece Value' },
            preview: 'Captured Piece : value : > Moved Piece Value'
          }
        ]
      }
    end

    def pawn_attack_example
      {
        title: 'Example 3: Is the moved piece attacked by a pawn?',
        explanation: 'Goal: punish moves that leave the moved piece exposed to an enemy pawn.',
        snippets: [
          {
            label: 'Plain English',
            body: '"After this move, does an enemy pawn attack the moved piece?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Enemy', filter: 'Pawn' },
            operator: 'Attack',
            target: { subject: 'Moved Piece', filter: 'Any' },
            preview: 'Enemy pawn : attack : Moved Piece'
          }
        ]
      }
    end

    def pawn_mobility_example
      {
        title: 'Example 4: Does this move improve knight mobility?',
        explanation: 'Goal: reward knight moves that leave that knight with more legal moves than it had before.',
        snippets: [
          {
            label: 'Plain English',
            body: '"If the moved piece is a knight, can it move more than it could before?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Moved Piece', filter: 'Knight' },
            operator: 'Mobility',
            comparison: { comparator: '>', value: 'Prior Board State' },
            preview: 'Moved Piece knight : mobility : > Prior Board State'
          }
        ]
      }
    end

    def defended_rook_example
      {
        title: 'Example 5: Did this move leave a rook defended?',
        explanation: 'Goal: reward positions where one of your rooks has friendly protection.',
        snippets: [
          {
            label: 'Plain English',
            body: '"After this move, does one of my pieces defend one of my rooks?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Allied', filter: 'Any' },
            operator: 'Defend',
            target: { subject: 'Allied', filter: 'Rook' },
            preview: 'Allies any : defend : Allied rook'
          }
        ]
      }
    end

    def cover_example
      {
        title: 'Example 6: Did this move cover a rook?',
        explanation: 'Goal: notice positions where one of your pieces covers another allied piece from an enemy rook, bishop, or queen whose movement geometry could line up with that ray to attack.',
        snippets: [
          {
            label: 'Plain English',
            body: '"After this move, does one of my pieces cover one of my rooks?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Allied', filter: 'Any' },
            operator: 'Cover',
            target: { subject: 'Allied', filter: 'Rook' },
            preview: 'Allies any : cover : Allied rook'
          }
        ]
      }
    end

    def same_piece_example
      {
        title: 'Example 8: Did the opponent recapture the same piece?',
        explanation: 'Goal: notice whether the enemy moved piece is the piece that captured your piece. Same-piece is a special relationship for capture context.',
        snippets: [
          {
            label: 'Plain English',
            body: '"Is the enemy moved piece the same piece as the captured piece?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Enemy Moved Piece' },
            operator: 'Same-Piece',
            target: { subject: 'Captured Piece' },
            preview: 'Enemy Moved Piece : is same-piece-as : Captured Piece'
          }
        ]
      }
    end

    def double_attack_example
      {
        title: 'Example 7: Does this move attack two valuable pieces?',
        explanation: 'Goal: reward moves where the moved piece attacks more than one non-pawn enemy piece. This uses a relational condition with a numerical comparison on the target side.',
        snippets: [
          {
            label: 'Plain English',
            body: '"After this move, does the moved piece attack more than one enemy non-pawn?"'
          },
          {
            label: 'In The Editor',
            kind: 'condition_editor',
            subject: { subject: 'Moved Piece', filter: 'Any' },
            operator: 'Attack',
            target: { subject: 'Enemy', filter: 'Pawn', non: true },
            target_comparison: { metric: 'Count', comparator: '>', value: '1' },
            preview: 'Moved Piece : attack : Enemy non-pawn (count > 1)'
          }
        ]
      }
    end

    def how_scoring_works
      {
        id: 'how-scoring-works',
        title: 'How Scoring Works',
        intro: 'Action nodes change the score of the move currently being tested. A condition decides whether the branch reaches the action; the action decides how much the move score changes.',
        bullets: [
          'Add increases the current score.',
          'Subtract decreases the current score.',
          'Set replaces the current score with a new number.',
          'Return sets the score and immediately stops reading the rest of the graph for that move.',
          'Cover is the relationship where one allied piece stands between another allied piece and enemy slider geometry.',
          'Use small Add/Subtract values for preferences and larger Return values for decisive patterns.'
        ],
        examples: [
          {
            title: 'A simple scoring branch',
            explanation: 'Pair a condition with an action when you can describe the idea as "if this is true, change the score."',
            snippets: [
              {
                label: 'Plain English',
                body: <<~TEXT.strip
                  If this move captures something,
                  add 3 points.
                TEXT
              },
              {
                label: 'Action Node',
                body: <<~TEXT.strip
                  Action: Add
                  Value: 3
                TEXT
              }
            ]
          }
        ]
      }
    end

    def test_and_inspect_matches
      {
        id: 'test-and-inspect-matches',
        title: 'Test and Inspect Matches',
        intro: 'Once a bot is ready, compile it and run matches. Replay is not only for watching the game back. You can stop on a position and inspect what your bot considered before it moved.',
        visual: {
          kind: 'replay_panel',
          title: 'This Is What You Might See During Replay',
          caption: 'The replay view can highlight the last move played, the move the bot chose, other moves tied for best score, and the move you are currently inspecting.',
          legend: [
            { label: 'Last move played', tone: 'last-move' },
            { label: 'Piece you selected', tone: 'selected-piece' },
            { label: 'Other legal move', tone: 'candidate' },
            { label: 'Chosen move', tone: 'chosen' },
            { label: 'Also tied for best', tone: 'tied' },
            { label: 'Move you are inspecting', tone: 'inspected' },
            { label: 'Trace panel', tone: 'trace' }
          ]
        },
        bullets: [
          'Compile from the editor before leaving if the bot is marked stale.',
          'Use match setup to choose your bot and an opponent.',
          'In replay, you can step forward, step backward, jump through notation, change speed, and restart from the beginning.',
          'Orange squares show the piece that just moved and the square it vacated.',
          'Pause on a position to inspect your bot choices for that turn.',
          'Click one of your bot pieces to narrow the move choices to that piece.',
          'Click a destination square to inspect that move in more detail.',
          'Highlighted squares show the move your bot selected, and sometimes other moves that were tied for the best score.',
          'If several moves were tied for best, the final move was chosen randomly from those top-scoring options.',
          'The trace shows which condition nodes passed and which action nodes changed the score.'
        ],
        examples: [
          {
            title: 'How to debug a strange move',
            explanation: 'When a bot plays a move you do not like, use replay to inspect what it was considering instead of guessing.',
            snippets: [
              {
                label: 'Replay Workflow',
                body: <<~TEXT.strip
                  1. Pause on the turn you want to understand
                  2. Look at the highlighted move your bot chose
                  3. If other highlighted squares appear, those were tied for the best score too
                  4. Click your bot piece to narrow the move choices
                  5. Click a destination square to inspect one move in detail
                  6. Read the trace to see why that move scored the way it did
                TEXT
              }
            ]
          }
        ]
      }
    end
  end
end
