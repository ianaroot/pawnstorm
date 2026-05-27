const WALK_DIAGRAM = `
  <svg class="bot-intro-diagram" viewBox="0 0 420 232" role="img" aria-label="Counterclockwise sibling order: the leftmost child and its descendant are visited first">
    <defs>
      <marker id="tour-walk-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0,0 L7,3.5 L0,7 z" class="bid-arrow-head" />
      </marker>
    </defs>
    <rect class="bid-box bid-box--root" x="176" y="12" width="68" height="32" rx="6" />
    <text class="bid-label" x="210" y="28">Root</text>
    <line class="bid-edge" x1="210" y1="44" x2="82" y2="104" marker-end="url(#tour-walk-arrow)" />
    <line class="bid-edge" x1="210" y1="44" x2="210" y2="104" marker-end="url(#tour-walk-arrow)" />
    <line class="bid-edge" x1="210" y1="44" x2="338" y2="104" marker-end="url(#tour-walk-arrow)" />
    <rect class="bid-box" x="40" y="104" width="84" height="32" rx="6" />
    <text class="bid-label" x="82" y="120">1st</text>
    <rect class="bid-box" x="168" y="104" width="84" height="32" rx="6" />
    <text class="bid-label" x="210" y="120">3rd</text>
    <rect class="bid-box" x="296" y="104" width="84" height="32" rx="6" />
    <text class="bid-label" x="338" y="120">4th</text>
    <line class="bid-edge" x1="82" y1="136" x2="82" y2="176" marker-end="url(#tour-walk-arrow)" />
    <rect class="bid-box bid-box--accent" x="40" y="176" width="84" height="32" rx="6" />
    <text class="bid-label" x="82" y="192">2nd</text>
    <path class="bid-orbit" d="M82 54 Q 210 140 338 54" marker-end="url(#tour-walk-arrow)" />
    <text class="bid-caption" x="210" y="222">depth-first; siblings counterclockwise from midnight</text>
  </svg>
`

const STEPS = [
  {
    target: null,
    placement: 'center',
    title: 'Welcome to the bot editor',
    body: `
      <p>Your bot follows a <strong>rulebook you build</strong>. Every legal move gets evaluated against your rules; the highest scored move is chosen.</p>
      <p>When nothing applies, or scores tie, the bot picks <strong>entirely randomly from the top-scoring moves</strong>.</p>
      <p>Let's build your first rule.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: '#canvas-workspace',
    title: 'Your graph lives here',
    body: `<p>This is your <strong>bot graph</strong>. The <strong>Root</strong> at the top is where every move's evaluation starts. Rules flow down from it.</p>`,
    advanceOn: 'next'
  },
  {
    target: '.btn-open-templates',
    title: 'Start with a template',
    body: `<p>Templates are pre-built rules — common patterns you can drop in. Click <strong>Templates</strong> to open the picker.</p>`,
    advanceOn: 'click'
  },
  {
    target: '.template-picker-modal__dialog',
    title: 'Insert the Checkmate template',
    body: `
      <p>Browse to <strong>King Pressure → Checkmate</strong> and click <strong>Insert Template</strong>.</p>
      <p>We're starting with one that lets your bot recognize checkmate.</p>
    `,
    advanceOn: { event: 'click', selector: '[data-template-picker-insert]' }
  },
  {
    target: () => document.querySelector('.node.organizer'),
    title: 'What an Organizer node does',
    body: `<p>The blue square at the top is an <strong>Organizer</strong>. It labels this chunk of graph but doesn't affect scoring.</p>`,
    advanceOn: 'next'
  },
  {
    target: '#canvas-workspace',
    title: 'Connect it to Root',
    body: `<p>For the template to run, connect it to Root. <strong>Drag from Root's output dot</strong> (bottom) <strong>to the Organizer's input dot</strong> (top).</p>`,
    advanceOn: { event: 'editor:connection-created' }
  },
  {
    target: '#canvas-workspace',
    title: 'How the bot walks the graph',
    body: `
      <p>For each move, the bot starts at Root and walks the graph <strong>depth-first</strong>.</p>

      <p>A condition <strong>passes</strong> when it's a true statement about the board <em>after</em> the move being evaluated, and the branch continues.</p>

      <p>Otherwise it <strong>fails</strong> — the bot backtracks to the next unevaluated branch or sub-branch and carries on from there.</p>

      <p>Score nodes change the score when reached.</p>

      <p>When a node has multiple children, the bot evaluates them <strong>counterclockwise from midnight</strong>.</p>

      ${WALK_DIAGRAM}
    `,
    advanceOn: 'next'
  },
  {
    target: '.btn-add-node[data-type="condition"]',
    title: 'Add your own condition',
    body: `<p>Now build one from scratch. Click <strong>+ Condition</strong>.</p>`,
    advanceOn: { event: 'editor:node-added', when: (d) => d.type === 'condition' }
  },
  {
    target: (ctx) => {
      const id = ctx.lastAdvanceDetail?.clientId
      return id ? document.querySelector(`.node[data-client-id="${id}"]`) : null
    },
    title: 'Open it to edit',
    body: `<p><strong>Click your new condition</strong> to open the editor on the right.</p>`,
    advanceOn: { event: 'editor:node-editing-started', when: (d) => d.type === 'condition' }
  },
  {
    target: '.condition-form-mode-picker',
    title: 'Pick a question kind',
    body: `
      <p>A condition asks one yes/no question — pick which <strong>kind</strong>.</p>

      <ul>
        <li><strong>Positions</strong> — count or measure pieces in regions.</li>
        <li><strong>Attack/Defend</strong> — relate two pieces (Targets, Shield, or Adjacent).</li>
        <li><strong>Captures</strong> — does this move capture, and what?</li>
      </ul>
    `,
    advanceOn: 'next'
  },
  {
    target: '#cond-left-subject',
    title: 'Who is the question about?',
    body: `
      <p>The <strong>Subject</strong> picks the piece in question:</p>
      <ul>
        <li><strong>Moved Piece</strong> — the piece making this move.</li>
        <li><strong>My Pieces</strong>, <strong>Enemy Pieces</strong> — any piece on the relevant team.</li>
        <li><strong>Enemy Moved Piece</strong> — the enemy piece from their last move.</li>
      </ul>

      <p>The filter narrows to a piece type; <strong>Non-</strong> inverts it.</p>

      <p><em>Moved Piece</em> is the powerful one. Compare:</p>
      <ul>
        <li>"Does my <strong>Moved Piece</strong> attack the enemy queen?"</li>
        <li>"Do <strong>any of my pieces</strong> attack the enemy queen?"</li>
      </ul>

      <p>The <em>any</em> version stays true as long as some piece keeps attacking — even on turns when you move a completely different piece. The Moved Piece version only scores when this turn's mover IS the attacker.</p>

      <p>Combine Moved Piece with <strong>Prior Board State</strong> (in the comparison block below) to ask whether the move <em>created</em> the attack, not just continues one.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: '#cond-left-comparison-section',
    title: 'Compare piece stats',
    body: `
      <p>This block asks about a piece's <strong>count</strong> or <strong>value</strong>:</p>
      <ul>
        <li><strong>Count</strong> — how many pieces satisfy the relation. <code>count ≥ 1</code> is an easy default: "at least one piece must match."</li>
        <li><strong>Value</strong> — the value of an <em>individual</em> piece satisfying the relation. <em>"At least one of my pieces with value ≤ 5 attacks the enemy queen."</em></li>
      </ul>

      <p><strong>Mobility</strong> (legal-move count) is a third metric — but it's only available in Positions conditions, reachable from the mode tab above.</p>

      <p>Pick a metric, a <strong>comparator</strong> (<em>greater than / at least / equals / at most / less than</em>), and what to compare against.</p>

      <p>The source can be a fixed Integer, another piece type, or <strong>Prior Board State</strong> — the same metric measured before this move.</p>

      <p>Comparing against Prior Board State catches what the move changed:</p>
      <ul>
        <li>Count of attackers <em>greater than</em> Prior Board State — rewards moves that pile on a relation.</li>
        <li>Moved Piece value <em>greater than</em> Prior Board State — detects promotion (the value just went up).</li>
      </ul>
    `,
    advanceOn: 'next'
  },
  {
    target: '#cond-formulation-preview',
    title: 'Read your condition',
    body: `
      <p>This line is your condition in plain English. It updates as you change the form, so you can verify you've built the question you meant to.</p>
      <p>Prefer terse chunks over sentences? Toggle <strong>Sentences: on/off</strong> in the toolbar.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: '#board-state-preview-wrap',
    title: 'Cycle through examples',
    body: `<p>Cycle the example boards with <kbd>← Prev</kbd> / <kbd>Next →</kbd> (or the <kbd>←</kbd>/<kbd>→</kbd> arrow keys). Press <kbd>P</kbd> to tuck the preview away.</p>`,
    advanceOn: 'next'
  },
  {
    target: '#save-node',
    title: 'Save it',
    body: `<p>When the Current Condition reads the way you want, click <strong>Save</strong>.</p>`,
    advanceOn: { event: 'editor:node-saved', when: (d) => d.type === 'condition' }
  },
  {
    target: '#canvas-workspace',
    title: 'Connect it to Root',
    body: `<p>Connect it to Root. <strong>Drag from Root's output dot to your condition's input dot.</strong></p>`,
    advanceOn: { event: 'editor:connection-created' }
  },
  {
    target: '#canvas-workspace',
    title: 'Removing a connection',
    body: `<p>To delete a connection, hover it — a small <strong>×</strong> appears. Click it to remove the line. You don't have to delete anything now; just know how.</p>`,
    advanceOn: 'next'
  },
  {
    target: '.btn-delete-node',
    title: 'Deleting a node',
    body: `<p>Select a node and press <kbd>Delete</kbd> or <kbd>Backspace</kbd>, or click the <strong>Delete</strong> button in the toolbar. Deleting a node also removes its connections.</p>`,
    advanceOn: 'next'
  },
  {
    target: '#canvas-workspace',
    title: 'Preview a chain of conditions',
    body: `
      <p><strong>Shift-click</strong> two or more connected conditions.</p>
      <p>Press <kbd>P</kbd> to see a position where every condition in the chain holds.</p>
    `,
    advanceOn: { event: 'editor:preview-shown', when: (d) => d.mode === 'selection' }
  },
  {
    target: '.btn-add-node[data-type="score"]',
    title: 'Reward or punish moves',
    body: `
      <p>Score nodes change the move's score when reached through TRUE conditions.</p>

      <ul>
        <li><strong>Add</strong> / <strong>Subtract</strong> — nudge up or down.</li>
        <li><strong>Set</strong> — replace the score with a fixed value.</li>
        <li><strong>Return</strong> — set the score and <strong>stop evaluating</strong> this move immediately.</li>
      </ul>

      <p>Use <strong>Subtract</strong> for negative chains: conditions that describe a <em>bad</em> circumstance ("my Moved Piece is undefended and attacked") with a Subtract underneath. The bot now disincentivizes those moves.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: null,
    placement: 'center',
    title: 'Tips for working faster',
    body: `
      <ul>
        <li><kbd>I</kbd> hover-toggle the big-text version of a node — useful in crowded graphs.</li>
        <li>Drag a node to move its <strong>whole branch</strong>; hold <kbd>Alt</kbd> to move just that node.</li>
        <li><kbd>Cmd/Ctrl+C</kbd> / <kbd>V</kbd> — copy and paste selected nodes.</li>
        <li><kbd>Cmd/Ctrl+Z</kbd> — undo. <kbd>Cmd/Ctrl+Shift+Z</kbd> — redo.</li>
      </ul>
    `,
    advanceOn: 'next'
  },
  {
    target: '#compile-and-exit-link',
    title: 'Compile to play',
    body: `<p>When you're ready, click <strong>Compile</strong>. That bakes your graph into a runnable bot. Then play it from the matches page.</p>`,
    advanceOn: 'next'
  },
  {
    target: null,
    placement: 'center',
    title: "You're set",
    body: `<p>That's the editor. Once you compile and play a match, look for <strong>Take the tour</strong> on the match page to learn the replay — it shows your bot's reasoning move-by-move.</p>`,
    advanceOn: 'next'
  }
]

export default STEPS
