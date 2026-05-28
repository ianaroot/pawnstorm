const swatch = (cssVar) =>
  `<span aria-hidden="true" style="display:inline-block;width:14px;height:14px;vertical-align:middle;background:rgb(var(${cssVar}));border-radius:3px;margin:0 2px;"></span>`

const passIcon = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style="vertical-align:middle;margin:0 2px;"><circle cx="8" cy="8" r="7" fill="#22c55e"/><path d="M4 8 L7 11 L12 5" fill="none" stroke="#062c14" stroke-width="2"/></svg>`

const failIcon = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style="vertical-align:middle;margin:0 2px;"><circle cx="8" cy="8" r="7" fill="#b57b7b"/><path d="M5 5 L11 11 M11 5 L5 11" stroke="#2c0606" stroke-width="2"/></svg>`

const scoreIcon = `<svg aria-hidden="true" width="280" height="26" viewBox="0 0 280 26" style="display:block;margin:8px auto;"><rect width="280" height="26" rx="3" fill="rgba(251, 191, 36, 0.14)" stroke="rgba(251, 191, 36, 0.35)" stroke-width="1"/><rect width="3" height="26" fill="#fbbf24"/><rect x="12" y="6" width="50" height="14" rx="7" fill="#798596"/><text x="37" y="16" text-anchor="middle" font-size="8" fill="#192535" font-family="sans-serif" font-weight="600">applied</text><text x="70" y="17" font-size="11" fill="#fde68a" font-family="sans-serif">add 5</text><text x="270" y="17" text-anchor="end" font-size="10" fill="#fde68a" font-family="sans-serif">0 → 5</text></svg>`

const organizerIcon = `<svg aria-hidden="true" width="64" height="14" viewBox="0 0 64 14" style="vertical-align:middle;margin:0 2px;"><rect width="64" height="14" rx="2" fill="#475569"/><text x="32" y="10" text-anchor="middle" fill="#cbd5e1" font-size="7" font-family="sans-serif">CHECKMATE</text></svg>`

const arrowIcon = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style="vertical-align:middle;margin:0 2px;"><path d="M4 4 L9 7 L4 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`

const LOCKED_CLASS = 'tour-locked'
const FORWARD_BUTTON = '[data-match-replay-target="forward-button"]'

const LOCKED_SELECTORS = [
  '[data-match-replay-target="play-button"]',
  '[data-match-replay-target="reverse-button"]',
  '[data-match-replay-target="top-moves-toggle"]',
  FORWARD_BUTTON,
  '.btn-rematch'
]

const setLocked = (selectors, locked) => {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.toggle(LOCKED_CLASS, locked)
    })
  })
}

const STEPS = [
  {
    target: null,
    placement: 'center',
    title: "Reading your bot's match",
    body: `<p>How to understand your bot's decision making.</p>`,
    advanceOn: 'next'
  },
  {
    target: ['.match-replay-controls', '.match-replay-speed'],
    title: 'Replay controls',
    body: `
      <ul>
        <li><strong>Back</strong> / <strong>Forward</strong> — one move at a time.</li>
        <li><strong>Play</strong> / <strong>Reverse</strong> — auto-step in either direction.</li>
        <li><strong>Restart</strong> — jump back to move 0.</li>
        <li><strong>0.5×</strong>–<strong>8×</strong> set auto-play pace.</li>
      </ul>
    `,
    advanceOn: 'next'
  },
  {
    target: '[data-match-replay-target="forward-button"]',
    title: 'Get into the match',
    body: `<p>Click <strong>Forward</strong> a few times to get into the meat of the match.</p>`,
    beforeEnter: () => setLocked([FORWARD_BUTTON], false),
    advanceOn: {
      event: 'replay:frame-changed',
      when: (d) => d.moveIndex >= 4 && d.allowedToMove === d.userBotTeam
    }
  },
  {
    target: '[data-match-replay-target="trace-summary"]',
    title: 'Top of the panel',
    body: `
      <ul>
        <li>The move's score.</li>
        <li>Board coordinates of the move evaluated below.</li>
        <li>A count of moves tied for top score (if you don't see this, then the bot was decisive about which move is best on this turn).</li>
      </ul>
    `,
    beforeEnter: () => {
      document.dispatchEvent(new CustomEvent('replay:request-pause'))
      setLocked([FORWARD_BUTTON], true)
    },
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.trace-tree-node--passed') || document.querySelector('[data-match-replay-target="trace-panel"]'),
    title: 'Passed condition',
    body: () => {
      const absent = !document.querySelector('.trace-tree-node--passed')
      return `<p>A <strong>green check</strong> ${passIcon} means this condition was true on the resulting board.${absent ? ' (None visible in this trace.)' : ''}</p>`
    },
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.trace-tree-node--failed') || document.querySelector('[data-match-replay-target="trace-panel"]'),
    title: 'Failed condition',
    body: () => {
      const absent = !document.querySelector('.trace-tree-node--failed')
      return `<p>A <strong>red ×</strong> ${failIcon} means this condition was false.${absent ? ' (None visible in this trace.)' : ''}</p>`
    },
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.trace-tree-node__score') || document.querySelector('[data-match-replay-target="trace-panel"]'),
    title: 'Score impact',
    body: () => {
      const absent = !document.querySelector('.trace-tree-node__score')
      return `<p>Score nodes that were reached show their impact on the move's score.${absent ? ' (None visible in this trace.)' : ''}</p>${scoreIcon}`
    },
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.trace-tree-organizer__summary') || document.querySelector('[data-match-replay-target="trace-panel"]'),
    title: 'Organizer titles',
    body: () => {
      const absent = !document.querySelector('.trace-tree-organizer__summary')
      return `<p>Organizer titles from your bot ${organizerIcon} appear as labels for their branch.${absent ? ' (None visible in this trace.)' : ''}</p>`
    },
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.trace-tree-organizer__summary') || document.querySelector('[data-match-replay-target="trace-panel"]'),
    title: 'Expand, collapse',
    body: () => {
      const absent = !document.querySelector('.trace-tree-organizer__summary')
      return `<p>Each branch has a small arrow ${arrowIcon} on its header — click it to collapse or expand.${absent ? ' (None visible in this trace.)' : ''}</p>`
    },
    advanceOn: 'next'
  },
  {
    target: '#chess-board',
    title: 'The highlighted moves',
    body: `
      <p>The bot's chosen move is highlighted here ${swatch('--match-replay-chosen-move')}.</p>
      <p>The <strong>tied top moves</strong> are highlighted here ${swatch('--match-replay-tied-move')}.</p>
      <p>Your opponent's last move is highlighted here ${swatch('--match-replay-last-move-end')}.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: '#chess-board',
    title: 'Click in to inspect',
    body: `
      <p>Click one of your pieces. Its legal moves get highlighted as candidates ${swatch('--match-replay-candidate-move')}.</p>
      <p>Now click one of the ${swatch('--match-replay-candidate-move')} moves to update the trace panel with that move's evaluation.</p>
    `,
    advanceOn: { event: 'replay:move-inspected' }
  },
  {
    target: '[data-match-replay-target="trace-panel"]',
    title: 'Now showing the selected move',
    body: `
      <p>The clicked move's highlight is now this color ${swatch('--match-replay-inspected-move')}.</p>
      <p>The panel updated — it's now showing the evaluation of the ${swatch('--match-replay-inspected-move')} move.</p>
      <p>Scroll if your bot's tree is tall enough to overflow.</p>
    `,
    advanceOn: 'next'
  },
  {
    target: '#chess-board',
    title: 'Reset to defaults',
    body: `<p>Click an empty tile (no piece, no highlight) to reset the panel back to the bot's chosen move.</p>`,
    advanceOn: 'next'
  },
  {
    target: '[data-match-replay-target="top-moves-toggle"]',
    title: 'Mute top moves',
    body: `<p>Hides highlights for tied top moves.</p>
    <p>Cleaner board, but you lose evidence of an unopinionated bot.</p>`,
    advanceOn: 'next'
  },
  {
    target: '.match-replay-notation',
    title: 'Game notation',
    body: `<p>Every move is listed here. Click any entry to jump straight to that position.</p>`,
    advanceOn: 'next'
  },
  {
    target: () => document.querySelector('.board-player-name--active'),
    title: 'Whose move is it?',
    body: `<p>Above and below the board, the player whose turn it is gets highlighted.</p>`,
    advanceOn: 'next'
  },
  {
    target: '.btn-rematch',
    title: 'Rematch',
    body: `<p>If you want a rematch, the button is right here.</p>`,
    advanceOn: 'next'
  },
  {
    target: null,
    placement: 'center',
    title: 'Improve your bot',
    body: `<p>Use this feature to learn how to improve your bot.</p>`,
    advanceOn: 'next'
  }
]

export default {
  steps: STEPS,
  onStart: () => setLocked(LOCKED_SELECTORS, true),
  onClose: () => setLocked(LOCKED_SELECTORS, false)
}
