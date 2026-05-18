function isCollectionSubject(subject) {
  return subject === 'allied' || subject === 'enemy'
}

function subjectLabel(subject) {
  switch (subject) {
    case 'allied':
      return 'Allied'
    case 'enemy':
      return 'Enemy'
    case 'moved_piece':
      return 'Moved Piece'
    case 'captured_piece':
      return 'Captured Piece'
    case 'enemy_moved_piece':
      return 'Enemy Moved Piece'
    case 'enemy_captured_piece':
      return 'Enemy Captured Piece'
    default:
      return subject
  }
}

function filterNoun(filter) {
  switch (filter) {
    case 'king':
      return 'king'
    case 'queen':
      return 'queen/s'
    case 'rook':
      return 'rook/s'
    case 'bishop':
      return 'bishop/s'
    case 'knight':
      return 'knight/s'
    case 'pawn':
      return 'pawn/s'
    case 'major':
      return 'major piece/s'
    case 'minor':
      return 'minor piece/s'
    default:
      return filter
  }
}

function filterPreview(filter, filterMode) {
  if (!filter || filter === 'any') { return 'any' }
  const noun = filterNoun(filter)
  return filterMode === 'exclude' ? `non-${noun}` : noun
}

function subjectPreview(subject, filter, filterMode) {
  const label = subjectLabel(subject)
  if (isCollectionSubject(subject)) {
    if (filter === 'any') {
      return `${subject === 'allied' ? 'Allies' : 'Enemies'} any`
    }
    return `${label} ${filterPreview(filter, filterMode)}`
  }
  if (filter && filter !== 'any') {
    return `${label} ${filterPreview(filter, filterMode)}`
  }
  return label
}

function operatorLabel(operator) {
  switch (operator) {
    case 'targets':
      return 'targets'
    case 'attack':
      return 'attack'
    case 'defend':
      return 'defend'
    case 'cover':
      return 'cover'
    case 'shield':
      return 'shield'
    case 'adjacent':
      return 'adjacent'
    case 'same_piece':
      return 'same-piece'
    case 'count':
      return 'count'
    case 'mobility':
      return 'mobility'
    case 'value':
      return 'value'
    default:
      return operator
  }
}

function operatorPreviewText(operator) {
  return operator === 'same_piece' ? 'is same-piece-as' : operatorLabel(operator)
}

function metricLabel(metric) {
  switch (metric) {
    case 'count':
      return 'count'
    case 'value':
      return 'value'
    case 'individual_value':
      return 'value'
    default:
      return metric
  }
}

function comparatorLabel(comparator) {
  switch (comparator) {
    case 'equal_to':
      return '='
    case 'greater_than':
      return '>'
    case 'less_than':
      return '<'
    case 'greater_than_or_equal_to':
      return '≥'
    case 'less_than_or_equal_to':
      return '≤'
    default:
      return comparator
  }
}

function comparisonSourcePreview(comparisonSource, comparisonSourceTotal) {
  if (comparisonSource === undefined || comparisonSource === null || comparisonSource === '') {
    return ''
  }
  if (typeof comparisonSource === 'number') {
    return String(comparisonSource)
  }
  if (comparisonSource === 'exact_number') {
    return String(comparisonSourceTotal)
  }
  switch (comparisonSource) {
    case 'moved_piece':
      return 'Moved Piece'
    case 'captured_piece':
      return 'Captured Piece'
    case 'enemy_moved_piece':
      return 'Enemy Moved Piece'
    case 'enemy_captured_piece':
      return 'Enemy Captured Piece'
    case 'prior_board_state':
      return 'Prior Board State'
    default:
      return String(comparisonSource)
  }
}

function sideComparisonPreview({ comparisonMetric, comparator, comparisonSource, comparisonSourceTotal }) {
  if (!comparisonMetric) { return '' }
  return `${metricLabel(comparisonMetric)} ${comparatorLabel(comparator)} ${comparisonSourcePreview(comparisonSource, comparisonSourceTotal)}`
}

function sidePreview({ subject, filter, filterMode, comparisonMetric, comparator, comparisonSource, comparisonSourceTotal }) {
  const base = subjectPreview(subject, filter, filterMode)
  const comparison = sideComparisonPreview({ comparisonMetric, comparator, comparisonSource, comparisonSourceTotal })
  return comparison ? `${base} (${comparison})` : base
}

function unaryTargetPreview({ target, targetFilter, targetFilterMode, targetTotal }) {
  if (target === 'exact_number') { return String(targetTotal) }
  if (target === 'prior_board_state') { return 'Prior Board State' }
  return subjectPreview(target, targetFilter || 'any', targetFilterMode || 'include')
}

function unaryTargetComparisonPreview({ comparator, target, targetFilter, targetFilterMode, targetTotal }) {
  return `${comparatorLabel(comparator)} ${unaryTargetPreview({ target, targetFilter, targetFilterMode, targetTotal })}`
}

function metricPreview({ operator, comparator, targetTotal }) {
  return `${operatorLabel(operator)} ${comparatorLabel(comparator)} ${targetTotal}`
}

function previewText({ left, operator, right }) {
  return `${left} : ${operator} : ${right}`
}

const FILE_LETTERS = 'abcdefgh'

function positionAxisPreview(axis, comparator, positionTarget) {
  const comparatorSymbol = comparatorLabel(comparator)
  if (axis === 'rank') {
    return `rank ${comparatorSymbol} ${positionTarget}`
  }
  if (axis === 'file') {
    return `file ${comparatorSymbol} ${FILE_LETTERS[(positionTarget - 1)] || positionTarget}`
  }
  if (axis === 'square') {
    const fileIndex = positionTarget % 8
    const rankIndex = Math.floor(positionTarget / 8)
    return `square ${FILE_LETTERS[fileIndex] || fileIndex + 1}${rankIndex + 1}`
  }
  return axis
}

let cachedSpecText
let cachedSpec

function sentenceSpec() {
  const element = typeof document !== 'undefined' ? document.getElementById('condition-sentence-spec') : null
  const text = element && element.textContent
  if (!text || !text.trim()) {
    throw new Error('#condition-sentence-spec not found — render the shared/condition_sentence_spec partial')
  }
  if (text !== cachedSpecText) {
    cachedSpec = JSON.parse(text)
    cachedSpecText = text
  }
  return cachedSpec
}

function snakeToCamel(key) {
  return key.replace(/_([a-z])/g, (_, character) => character.toUpperCase())
}

function buildSentenceChunk(descriptor, payload) {
  const chunk = { role: descriptor.role }
  for (const [chunkKey, payloadKey] of Object.entries(descriptor.fields || {})) {
    chunk[snakeToCamel(chunkKey)] = payload[payloadKey]
  }
  for (const [chunkKey, value] of Object.entries(descriptor.consts || {})) {
    chunk[snakeToCamel(chunkKey)] = value
  }
  return chunk
}

function sentenceDescriptors(spec, payload) {
  if (Array.isArray(spec)) { return spec }
  // Mirrors NodePresenter: positionAxis presence picks region vs whole.
  return payload.positionAxis != null ? spec.region : spec.whole
}

export function formatConditionPreview(nodeData = {}) {
  const spec = sentenceSpec()[nodeData.kind]
  if (!spec) {
    return { left: '', operator: '', right: '', text: '[invalid condition]' }
  }
  const [left, operator, right] = sentenceDescriptors(spec, nodeData)
    .map(descriptor => formatConditionPreviewChunk(buildSentenceChunk(descriptor, nodeData)))
  const preview = { left, operator, right }
  preview.text = previewText(preview)
  return preview
}

export function formatConditionPreviewChunk(chunk) {
  switch (chunk.role) {
    case 'side':
      return sidePreview({ ...chunk, filter: chunk.filter || 'any', filterMode: chunk.filterMode || 'include' })
    case 'operator':
      return operatorPreviewText(chunk.operator)
    case 'comparison':
      return unaryTargetComparisonPreview(chunk)
    case 'region':
      return positionAxisPreview(chunk.positionAxis, chunk.positionComparator, chunk.positionTarget)
    case 'metric':
      return metricPreview(chunk)
    default:
      return chunk.text || ''
  }
}

function parseChunkDataset(element) {
  const { dataset } = element
  return {
    role: dataset.conditionPreviewRole,
    subject: dataset.conditionPreviewSubject,
    filter: dataset.conditionPreviewFilter,
    filterMode: dataset.conditionPreviewFilterMode,
    comparisonMetric: dataset.conditionPreviewComparisonMetric,
    comparator: dataset.conditionPreviewComparator,
    comparisonSource: dataset.conditionPreviewComparisonSource,
    comparisonSourceTotal: dataset.conditionPreviewComparisonSourceTotal,
    target: dataset.conditionPreviewTarget,
    targetFilter: dataset.conditionPreviewTargetFilter,
    targetFilterMode: dataset.conditionPreviewTargetFilterMode,
    targetTotal: dataset.conditionPreviewTargetTotal,
    operator: dataset.conditionPreviewOperator,
    positionAxis: dataset.conditionPreviewPositionAxis,
    positionComparator: dataset.conditionPreviewPositionComparator,
    positionTarget: dataset.conditionPreviewPositionTarget === undefined
      ? undefined
      : Number(dataset.conditionPreviewPositionTarget),
    text: element.textContent
  }
}

export function formatConditionPreviewElement(element) {
  if (!element) { return }
  element.querySelectorAll('.condition-preview__chunk[data-condition-preview-role]').forEach((chunkElement) => {
    chunkElement.textContent = formatConditionPreviewChunk(parseChunkDataset(chunkElement))
  })
}

// ── Natural-language sentence composer ───────────────────────────────────────
// Statement-voice rendering as ordered segments [{ text, emphasis? }]. Dispatch
// is on the chunk-role signature (never node kind). See editorV2/RULES.md.

const SINGULAR_ACTOR = {
  moved_piece: 'my moved piece',
  captured_piece: 'my capture',
  enemy_moved_piece: "enemy's just-moved piece",
  enemy_captured_piece: "enemy's just-captured piece"
}
const SPECIES = {
  king: 'king', queen: 'queen', rook: 'rook', bishop: 'bishop',
  knight: 'knight', pawn: 'pawn', major: 'major piece', minor: 'minor piece'
}
const ACTIVE_VERB = {
  attack: ['attacks', 'attack'],
  defend: ['defends', 'defend'],
  cover: ['covers', 'cover'],
  targets: ['targets', 'target'],
  adjacent: ['is adjacent to', 'are adjacent to']
}
const PASSIVE_VERB = { attack: 'attacked', defend: 'defended', shield: 'shielded' }

function noun(filter, filterMode, plural) {
  if (!filter || filter === 'any') { return plural ? 'pieces' : 'piece' }
  if (filterMode === 'exclude') {
    if (filter === 'major' || filter === 'minor') { return `non-${filter} ${plural ? 'pieces' : 'piece'}` }
    return plural ? `non-${filter}s` : `non-${filter}`
  }
  const base = SPECIES[filter] || filter
  return plural ? `${base}s` : base
}

// Value/relation "pieces" phrase: exclude → "non-X pieces", species → plural,
// no filter → "value". Shared by relational target-passive and census value.
function filteredPieces(filter, filterMode) {
  if (!filter || filter === 'any') { return 'value' }
  if (filterMode === 'exclude') { return `non-${filter} pieces` }
  return `${SPECIES[filter] || filter}s`
}

// Quantifier word/phrase + whether it carries emphasis, for count comparisons.
function quantify({ comparator, source, total }) {
  if (source === 'prior_board_state') {
    switch (comparator) {
      case 'greater_than': return { q: 'more', delta: true }
      case 'less_than': return { q: 'fewer', delta: true }
      case 'greater_than_or_equal_to': return { q: 'no fewer', delta: true }
      case 'less_than_or_equal_to': return { q: 'no more', delta: true }
      default: return { q: 'same number', delta: true, same: true }
    }
  }
  const n = Number(total)
  switch (comparator) {
    case 'equal_to': return { q: n === 0 ? '0' : `exactly ${n}` }
    case 'greater_than': return { q: n === 0 ? 'at least one' : `more than ${n}`, atLeastOne: n === 0 }
    case 'greater_than_or_equal_to': return { q: `${n} or more` }
    case 'less_than_or_equal_to': return { q: `${n} or fewer` }
    case 'less_than': return { q: `fewer than ${n}` }
    default: return { q: String(n) }
  }
}

// "<Q> of my <plural>" / "<Q> enemy <noun>" — the locked of-my / enemy asymmetry.
function countedGroup(token, filter, filterMode, info) {
  if (token === 'allied') { return `of my ${noun(filter, filterMode, true)}` }
  return `enemy ${noun(filter, filterMode, !info.atLeastOne)}`
}

function actorNoun(token, filter, filterMode) {
  if (SINGULAR_ACTOR[token]) {
    const base = SINGULAR_ACTOR[token]
    if (filter && filter !== 'any' && base.endsWith('piece')) {
      return base.replace(/piece$/, SPECIES[filter] || filter)
    }
    return base
  }
  const poss = token === 'allied' ? 'my' : 'enemy'
  if (!filter || filter === 'any') { return `${poss} pieces` }
  if (filterMode === 'exclude') { return `${poss} non-${filter} pieces` }
  return `${poss} ${SPECIES[filter] || filter}`
}

function tail(info) {
  if (!info.delta) { return '' }
  return info.same ? ' as before' : ' than before'
}

function composeRelational(d) {
  if (d.operator === 'same_piece') {
    return [{ text: 'I captured the piece the enemy just moved' }]
  }
  const targetNP = actorNoun(d.target, d.targetFilter, d.targetFilterMode)
  const metric = d.subjectComparisonMetric

  if (metric && metric !== 'count') {
    // value (incl. aggregate_value/individual_value) → target-passive
    const info = quantify({
      comparator: d.subjectComparator, source: d.subjectComparisonSource,
      total: d.subjectComparisonSourceTotal
    })
    const pieces = filteredPieces(d.subjectFilter, d.subjectFilterMode)
    const passive = PASSIVE_VERB[d.operator] || PASSIVE_VERB.attack
    if (info.same) {
      return [
        { text: `${targetNP} is ${passive} by the ` },
        { text: 'same', emphasis: true },
        { text: ` ${pieces} as before` }
      ]
    }
    return [
      { text: `${targetNP} is ${passive} by ` },
      { text: info.q, emphasis: true },
      { text: ` ${pieces}${tail(info)}` }
    ]
  }

  // count metric, or bare condition (implicit count > 0)
  const info = metric
    ? quantify({ comparator: d.subjectComparator, source: d.subjectComparisonSource, total: d.subjectComparisonSourceTotal })
    : { q: 'at least one', atLeastOne: true }
  const verbPair = ACTIVE_VERB[d.operator] || ACTIVE_VERB.attack
  const verb = info.atLeastOne ? verbPair[0] : verbPair[1]
  const group = countedGroup(d.subject, d.subjectFilter, d.subjectFilterMode, info)

  if (info.same) {
    return [
      { text: 'the ' },
      { text: 'same number', emphasis: true },
      { text: ` of ${d.subject === 'allied' ? 'my' : 'enemy'} ${noun(d.subjectFilter, d.subjectFilterMode, true)} ${verbPair[1]} ${targetNP} as before` }
    ]
  }
  return [
    { text: info.q, emphasis: true },
    { text: ` ${group} ${verb} ${targetNP}${tail(info)}` }
  ]
}

function valueClause(comparator, n) {
  switch (comparator) {
    case 'less_than': return `less than ${n}`
    case 'greater_than': return `more than ${n}`
    case 'equal_to': return `exactly ${n}`
    case 'greater_than_or_equal_to': return `${n} or more`
    case 'less_than_or_equal_to': return `${n} or fewer`
    default: return String(n)
  }
}

function composeCensusWhole(d) {
  const metric = d.operator
  const collection = isCollectionSubject(d.subject)

  if (metric === 'mobility') {
    const subj = collection
      ? (d.subject === 'enemy' ? 'enemy' : 'my pieces')
      : actorNoun(d.subject, d.subjectFilter, d.subjectFilterMode)
    const verb = collection && d.subject === 'allied' ? 'have' : 'has'
    const info = quantify({ comparator: d.comparator, source: d.target, total: d.targetTotal })
    return [
      { text: `${subj} ${verb} ` },
      { text: info.q, emphasis: true },
      { text: ` legal moves${tail(info)}` }
    ]
  }

  if (metric === 'value') {
    if (d.target === 'prior_board_state') {
      if (d.comparator === 'greater_than') {
        return [{ text: 'I ' }, { text: 'promoted', emphasis: true }, { text: ' a pawn' }]
      }
      if (d.comparator === 'less_than') {
        return [{ text: 'I ' }, { text: 'captured', emphasis: true }, { text: ' a piece' }]
      }
      const poss = d.subject === 'enemy' ? "the enemy's" : 'my'
      const filtered = d.subjectFilter && d.subjectFilter !== 'any'
      const lead = filtered
        ? `the value of ${poss} ${filteredPieces(d.subjectFilter, d.subjectFilterMode)} is `
        : `${poss} team value is `
      const phrase = d.comparator === 'greater_than_or_equal_to' ? 'not lower'
        : d.comparator === 'less_than_or_equal_to' ? 'not higher'
        : 'not changed'
      const suffix = d.comparator === 'equal_to' ? '' : ' than before'
      return [{ text: lead }, { text: phrase, emphasis: true }, { text: suffix }]
    }
    if (SINGULAR_ACTOR[d.target]) {
      const word = d.comparator === 'less_than' ? 'less'
        : d.comparator === 'greater_than_or_equal_to' ? 'no less'
        : d.comparator === 'less_than_or_equal_to' ? 'no more'
        : d.comparator === 'equal_to' ? 'equal' : 'more'
      const connector = d.comparator === 'equal_to' ? 'as' : 'than'
      return [
        { text: 'I captured ' },
        { text: word, emphasis: true },
        { text: ` value ${connector} the enemy just did` }
      ]
    }
    return [
      { text: `${d.subject === 'enemy' ? 'enemy' : 'my'} pieces have ` },
      { text: valueClause(d.comparator, Number(d.targetTotal)), emphasis: true },
      { text: ' total value' }
    ]
  }

  // count
  if (SINGULAR_ACTOR[d.subject]) {
    const exists = d.comparator === 'greater_than'
    if (d.subjectFilter && d.subjectFilter !== 'any') {
      const sp = SPECIES[d.subjectFilter] || d.subjectFilter
      return exists
        ? [{ text: `${SINGULAR_ACTOR[d.subject]} ` }, { text: 'is', emphasis: true }, { text: ` a ${sp}` }]
        : [{ text: `${SINGULAR_ACTOR[d.subject]} is ` }, { text: 'not', emphasis: true }, { text: ` a ${sp}` }]
    }
    if (exists) { return [{ text: 'I ' }, { text: 'capture', emphasis: true }, { text: ' a piece' }] }
    return [{ text: 'this move ' }, { text: 'captures nothing', emphasis: true }]
  }
  const info = quantify({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  const n = noun(d.subjectFilter, d.subjectFilterMode, !info.atLeastOne)
  return [
    { text: d.subject === 'enemy' ? 'enemy has ' : 'I have ' },
    { text: info.q, emphasis: true },
    { text: ` ${n}` }
  ]
}

const FILES = 'abcdefgh'

// { prefix, bound } — only `bound` is emphasized; "on"/"the"/"between" stay plain.
function regionPhrase(d) {
  const cmp = d.positionComparator
  const t = Number(d.positionTarget)
  if (d.positionAxis === 'square') {
    return { prefix: 'on ', bound: `${FILES[t % 8]}${Math.floor(t / 8) + 1}` }
  }
  if (d.positionAxis === 'file') {
    const L = FILES[t - 1]
    if (cmp === 'equal_to') { return { prefix: 'on the ', bound: `${L}-file` } }
    if (cmp === 'greater_than_or_equal_to') { return { prefix: 'between files ', bound: `${L} & h` } }
    return { prefix: 'between files ', bound: `a & ${L}` }
  }
  if (cmp === 'equal_to') { return { prefix: 'on ', bound: `rank ${t}` } }
  if (cmp === 'greater_than_or_equal_to') { return { prefix: 'between ranks ', bound: `${t} & 8` } }
  return { prefix: 'between ranks ', bound: `1 & ${t}` }
}

function composeCensusRegion(d) {
  const region = regionPhrase(d)
  if (d.target === 'prior_board_state') {
    const info = quantify({ comparator: d.comparator, source: 'prior_board_state' })
    const group = d.subject === 'allied'
      ? `of my ${noun(d.subjectFilter, d.subjectFilterMode, true)}`
      : `enemy ${noun(d.subjectFilter, d.subjectFilterMode, true)}`
    return [
      { text: info.q, emphasis: true },
      { text: ` ${group} are ${region.prefix}${region.bound} than before` }
    ]
  }
  const info = quantify({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  const n = noun(d.subjectFilter, d.subjectFilterMode, !info.atLeastOne)
  const lead = d.subject === 'enemy' ? 'enemy has ' : 'I have '
  return [
    { text: `${lead}${info.q} ${n} ${region.prefix}` },
    { text: region.bound, emphasis: true }
  ]
}

export function formatConditionSentence(nodeData = {}) {
  const spec = sentenceSpec()[nodeData.kind]
  if (!spec) { return [{ text: '[invalid condition]' }] }
  const chunks = sentenceDescriptors(spec, nodeData).map(dscr => buildSentenceChunk(dscr, nodeData))
  const signature = chunks.map(c => c.role).join('|')
  switch (signature) {
    case 'side|operator|side': return composeRelational(nodeData)
    case 'side|operator|comparison': return composeCensusWhole(nodeData)
    case 'side|region|metric': return composeCensusRegion(nodeData)
    default: return [{ text: '[invalid condition]' }]
  }
}

// Shared DOM render: segments → text nodes + <strong>, no innerHTML.
export function renderSentenceSegments(target, segments) {
  target.textContent = ''
  for (const seg of segments) {
    if (seg.emphasis) {
      const strong = document.createElement('strong')
      strong.textContent = seg.text
      target.appendChild(strong)
    } else {
      target.appendChild(document.createTextNode(seg.text))
    }
  }
  return target
}

export function renderConditionSentence(target, nodeData) {
  return renderSentenceSegments(target, formatConditionSentence(nodeData))
}
