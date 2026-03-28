class BotGuide
  class << self
    def title
      'Build a Chess Bot'
    end

    def intro
      'Pawnstorm bots do not plan many turns ahead. Instead, they look at each legal move one at a time, walk through your graph, score that move, and then play one of the highest-scoring options.'
    end

    def drawer_intro
      'Use this while you build. The main thing to learn is how condition nodes read, how branch order works, and how replay helps you debug your bot.'
    end

    def sections
      [
        {
          id: 'what-your-bot-does',
          title: 'What Your Bot Does',
          intro: 'Your bot does the same simple job over and over: it checks one legal move, walks through your graph, changes that move score when branches match, and then compares that score against the other legal moves.',
          bullets: [
            'The root node is the starting point for every move your bot considers.',
            'Condition nodes ask questions about the move being tested.',
            'Action nodes reward, punish, replace, or immediately finalize that move score.',
            'At the end, your bot picks one of the highest-scoring legal moves.'
          ],
          examples: [
            {
              title: 'The basic loop',
              explanation: 'You can think of a bot turn as a short scoring loop.',
              snippets: [
                {
                  label: 'Bot Turn',
                  body: <<~TEXT.strip
                    1. Look at one legal move
                    2. Walk through the graph
                    3. Change that move's score when branches match
                    4. Repeat for every legal move
                    5. Play one of the highest-scoring moves
                  TEXT
                }
              ]
            }
          ]
        },
        {
          id: 'how-the-graph-is-read',
          title: 'How the Graph Is Read',
          intro: 'Graph order matters. Pawnstorm reads your graph depth first, and if a node has more than one child, their order is decided by where they sit around the parent.',
          visual: {
            kind: 'mini_graph',
            title: 'Branch Order Example',
            caption: 'Pawnstorm starts at the root, checks the child closest to straight down first, then moves counter-clockwise. It follows each branch depth first before returning to the next sibling.',
            nodes: [
              { label: 'Root', type: 'root', position: 'top' },
              { label: 'First child', type: 'condition', position: 'south', order: '1st' },
              { label: 'Second child', type: 'condition', position: 'east', order: '2nd' },
              { label: 'Third child', type: 'condition', position: 'north_west', order: '3rd' },
              { label: 'Deep child', type: 'action', position: 'south_child' }
            ]
          },
          bullets: [
            'Pawnstorm starts at the root node.',
            'It walks depth first, which means it follows a branch downward before it comes back and tries the next sibling branch.',
            'If a parent has several children, child precedence is determined counter-clockwise, starting from straight down from the parent.',
            'That means layout is not only visual. Position also changes evaluation order.'
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
        },
        {
          id: 'how-to-read-a-condition',
          title: 'How to Read Nodes',
          intro: 'Condition nodes are the heart of the system. A condition node is a question about the move being tested. If the answer is yes, Pawnstorm continues down that branch. If the answer is no, that branch stops there.',
          visual: {
            kind: 'node_pair',
            title: 'What These Nodes Look Like',
            caption: 'Here is what a condition node and an action node can look like in practice.',
            cards: [
              {
                type: 'condition',
                title: 'Condition node',
                preview: "Captured piece\nValue >= moved piece",
                note: 'A yes/no question about the move being tested'
              },
              {
                type: 'action',
                title: 'Action node',
                preview: "Return\n100",
                note: 'Changes the score for that move'
              }
            ]
          },
          bullets: [
            'Subject tells Pawnstorm what to look at: the moved piece, your pieces, the opponent pieces, or the captured piece.',
            'Subject specifier narrows that down to a piece type, like any piece, rook, knight, or pawn.',
            'Relation tells Pawnstorm what to measure: count, value, attacker, defended, mobility, and so on.',
            'Relation specifier narrows that relation when the relation supports filtering.',
            'Comparison decides how to test the measured value.',
            'Comparison value is the number or reference value the condition checks against.'
          ],
          examples: [
            {
              title: 'A good reading pattern',
              explanation: 'Most condition nodes can be read in everyday language using the same pattern.',
              snippets: [
                {
                  label: 'Translation Pattern',
                  body: <<~TEXT.strip
                    Subject: what to look at
                    Subject specifier: how to narrow it down
                    Relation: what to measure
                    Relation specifier: how to filter that relation, if needed
                    Comparison: how to test the result
                    Comparison value: what to test it against
                  TEXT
                },
                {
                  label: 'Example Reading',
                  body: <<~TEXT.strip
                    Look at: moved piece
                    Measure: attackers
                    Check whether that is: greater than 0

                    Plain English:
                    "After this move, is the moved piece attacked?"
                  TEXT
                }
              ]
            }
          ]
        },
        {
          id: 'condition-examples',
          title: 'Condition Examples',
          intro: 'The easiest way to learn condition nodes is to see the same grammar used for real chess ideas. Start with the plain-English goal, then match it to the editor fields.',
          bullets: [
            'Use these examples as patterns you can borrow and remix.',
            'The plain-English line is what the node means.',
            'The editor block shows how to express that idea in the node editor.'
          ],
          examples: [
            {
              title: 'Example 1: Is this move a capture?',
              explanation: 'Goal: reward moves that capture something.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "Does this move capture a piece?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Captured piece
                    Subject specifier: Any piece
                    Relation: Count
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: 0
                  TEXT
                }
              ]
            },
            {
              title: 'Example 2: Does this move hang a knight?',
              explanation: 'Goal: punish risky knight moves. This example teaches subject specifiers.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "If the piece I moved is a knight, does it end the move under attack?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Moved piece
                    Subject specifier: Knight
                    Relation: Attacker
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: 0
                  TEXT
                }
              ]
            },
            {
              title: 'Example 3: Does this move capture a queen?',
              explanation: 'Goal: reward queen captures. This example shows a piece-specific captured piece check.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "Does this move capture a queen?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Captured piece
                    Subject specifier: Queen
                    Relation: Count
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: 0
                  TEXT
                }
              ]
            },
            {
              title: 'Example 4: Does this move win material?',
              explanation: 'Goal: reward captures where the captured piece is worth more than the moving piece. This example teaches comparison against another value instead of a fixed number.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "Is the captured piece worth more than the piece I moved?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Captured piece
                    Subject specifier: Any piece
                    Relation: Value
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: Value of moved piece
                  TEXT
                }
              ]
            },
            {
              title: 'Example 5: Is the moved piece attacked by a pawn?',
              explanation: 'Goal: notice a specific kind of danger. This example teaches relation specifiers.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "After this move, is the moved piece attacked by a pawn?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Moved piece
                    Subject specifier: Any piece
                    Relation: Attacker
                    Relation specifier: Pawn
                    Comparison: Greater than
                    Comparison value: 0
                  TEXT
                }
              ]
            },
            {
              title: 'Example 6: Does this move improve pawn mobility?',
              explanation: 'Goal: reward pawn moves that leave that pawn with more freedom than before. This example teaches comparison against the prior board state.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "If the moved piece is a pawn, can it move more than it could before?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Moved piece
                    Subject specifier: Pawn
                    Relation: Mobility
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: Prior board state
                  TEXT
                }
              ]
            },
            {
              title: 'Example 7: Did this move make one of my rooks defended?',
              explanation: 'Goal: reward moves that improve protection for a specific kind of friendly piece.',
              snippets: [
                {
                  label: 'Plain English',
                  body: <<~TEXT.strip
                    "After this move, do I have any defended rooks?"
                  TEXT
                },
                {
                  label: 'In The Editor',
                  body: <<~TEXT.strip
                    Subject: Allies
                    Subject specifier: Rook
                    Relation: Defended
                    Relation specifier: Any piece
                    Comparison: Greater than
                    Comparison value: 0
                  TEXT
                }
              ]
            }
          ]
        },
        {
          id: 'how-scoring-works',
          title: 'How Scoring Works',
          intro: 'Action nodes are much simpler than condition nodes. Their job is just to change the score of the move currently being tested.',
          bullets: [
            'Add increases the current score.',
            'Subtract decreases the current score.',
            'Set replaces the current score with a new number.',
            'Return sets the score and immediately stops reading the rest of the graph for that move.'
          ],
          examples: [
            {
              title: 'A simple scoring branch',
              explanation: 'You can pair a condition with an action to express a clear idea in plain English.',
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
        },
        {
          id: 'test-and-inspect-matches',
          title: 'Test and Inspect Matches',
          intro: 'Once a bot is ready, compile it and run matches. Replay is not only for watching the game back. You can also stop on a position and inspect what your bot was considering before it moved.',
          visual: {
            kind: 'replay_panel',
            title: 'This Is What You Might See During Replay',
            caption: 'The replay view can highlight the move the bot chose, other moves tied for best score, and the move you are currently inspecting.',
            legend: [
              { label: 'Chosen move', tone: 'selected' },
              { label: 'Also tied for best', tone: 'tied' },
              { label: 'Move you are inspecting', tone: 'inspected' },
              { label: 'Trace panel', tone: 'trace' }
            ]
          },
          bullets: [
            'Compile from the editor before leaving if the bot is marked stale.',
            'Use match setup to choose your bot and an opponent.',
            'In replay, you can step forward, step backward, jump through notation, change speed, and restart from the beginning.',
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
      ]
    end
  end
end
