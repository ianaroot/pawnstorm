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

function metricPreview({ operator, comparator, target, targetTotal }) {
  return `${operatorLabel(operator)} ${comparatorLabel(comparator)} ${unaryTargetPreview({ target, targetTotal })}`
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
const OPERATORS = {
  attack:   { active: ['attacks', 'attack'],                 passive: 'attacked',  gerund: 'attacking' },
  defend:   { active: ['defends', 'defend'],                 passive: 'defended',  gerund: 'defending' },
  cover:    { active: ['covers', 'cover'],                   passive: 'covered',   gerund: 'covering' },
  shield:   { active: ['shields', 'shield'],                 passive: 'shielded',  gerund: 'shielding' },
  targets:  { active: ['targets', 'target'],                 passive: 'targeted',  gerund: 'targeting' },
  adjacent: { active: ['is adjacent to', 'are adjacent to'], gerund: 'adjacent to' }
}

function opForm(operator, form) {
  return OPERATORS[operator]?.[form] || OPERATORS.attack[form]
}

// "attacked by" for directional verbs; the symmetric "adjacent to" takes no agent marker.
function passiveBy(operator) {
  return operator === 'adjacent' ? 'adjacent to' : `${opForm(operator, 'passive')} by`
}

function noun(filter, filterMode, plural) {
  if (!filter || filter === 'any') { return plural ? 'pieces' : 'piece' }
  if (filterMode === 'exclude') {
    if (filter === 'major' || filter === 'minor') { return `non-${filter} ${plural ? 'pieces' : 'piece'}` }
    return plural ? `non-${filter}s` : `non-${filter}`
  }
  const base = speciesNoun(filter)
  return plural ? `${base}s` : base
}

function speciesNoun(filter) { return SPECIES[filter] || filter }
function haveHas(plural) { return plural ? 'have' : 'has' }
function areIs(plural) { return plural ? 'are' : 'is' }
function teamHas(subject) { return subject === 'enemy' ? 'enemy has' : 'I have' }

// Comparator → bare delta word, for "X more/fewer than before" and "vs a singular actor".
function deltaCountWord(comparator) {
  switch (comparator) {
    case 'greater_than': return 'more'
    case 'less_than': return 'fewer'
    case 'greater_than_or_equal_to': return 'no fewer'
    case 'less_than_or_equal_to': return 'no more'
    default: return 'same number'
  }
}

function quantifyCount({ comparator, source, total }) {
  if (source === 'prior_board_state') {
    const q = deltaCountWord(comparator)
    return { q, delta: true, same: q === 'same number' }
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

function comparatorValuableWord(comparator) {
  switch (comparator) {
    case 'greater_than': return 'more valuable'
    case 'less_than': return 'less valuable'
    case 'greater_than_or_equal_to': return 'no less valuable'
    case 'less_than_or_equal_to': return 'no more valuable'
    default: return 'equally valuable'
  }
}

function valuableConnector(comparator, source) {
  if (comparator !== 'equal_to') return 'than'
  return source === 'prior_board_state' ? 'as' : 'to'
}

function valuableRef(source, total) {
  if (source === 'prior_board_state') return 'before'
  if (SINGULAR_ACTOR[source]) return SINGULAR_ACTOR[source]
  return String(Number(total))
}

function valueModifierSegments(comparator, source, total) {
  return [
    { text: comparatorValuableWord(comparator), emphasis: true },
    { text: ` ${valuableConnector(comparator, source)} ${valuableRef(source, total)}` }
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

function actorNP(token, filter, filterMode, { plural: forcePlural = false } = {}) {
  if (SINGULAR_ACTOR[token]) {
    const base = SINGULAR_ACTOR[token]
    if (filter && filter !== 'any') {
      const sp = speciesNoun(filter)
      if (base.endsWith('piece')) return { text: base.replace(/piece$/, sp), plural: false }
      if (token === 'captured_piece') return { text: `my captured ${sp}`, plural: false }
    }
    return { text: base, plural: false }
  }
  const poss = token === 'allied' ? 'my' : 'enemy'
  // 'any', exclude, and major/minor are inherently plural; a species pluralizes on demand.
  const plural = forcePlural || !filter || filter === 'any' || filterMode === 'exclude' || filter === 'major' || filter === 'minor'
  return { text: `${poss} ${noun(filter, filterMode, plural)}`, plural }
}

function relationalSideNP(token, filter, filterMode, info) {
  if (!info || SINGULAR_ACTOR[token]) {
    const np = actorNP(token, filter, filterMode)
    return {
      segments: [{ text: np.text }],
      info: null,
      plural: np.plural
    }
  }
  const body = token === 'allied'
    ? `of my ${noun(filter, filterMode, true)}`
    : `enemy ${noun(filter, filterMode, !info.atLeastOne)}`
  return {
    segments: [{ text: info.q, emphasis: true }, { text: ` ${body}` }],
    info,
    plural: !info.atLeastOne
  }
}

function tail(info) {
  if (!info || !info.delta) { return '' }
  return info.same ? ' as before' : ' than before'
}

// Singular actors carry count only as existence: =1 participates (count omitted),
// =0 negates. Other comparisons can't be rendered (gating prevents them).
function countExistenceSense(comparator, total) {
  if (comparator === 'equal_to' && Number(total) === 0) { return 'negate' }
  if (comparator === 'equal_to' && Number(total) === 1) { return 'affirm' }
  return 'warn'
}

function singularCountSense(d, side) {
  const token = side === 'subject' ? d.subject : d.target
  const metric = side === 'subject' ? d.subjectComparisonMetric : d.targetComparisonMetric
  if (!SINGULAR_ACTOR[token] || metric !== 'count') { return null }
  const comparator = side === 'subject' ? d.subjectComparator : d.targetComparator
  const total = side === 'subject' ? d.subjectComparisonSourceTotal : d.targetComparisonSourceTotal
  return countExistenceSense(comparator, total)
}

function negatedVerb(operator, plural) {
  if (operator === 'adjacent') { return plural ? 'are not adjacent to' : 'is not adjacent to' }
  return `${plural ? 'do' : 'does'} not ${opForm(operator, 'active')[1]}`
}

function appendCountWarnings(result, subjectSense, targetSense) {
  const warnings = []
  if (subjectSense === 'warn') { warnings.push("subject's count comparison") }
  if (targetSense === 'warn') { warnings.push("target's count comparison") }
  if (warnings.length) { result.push({ text: ` ⚠ couldn't render ${warnings.join(' and ')}` }) }
}

function composeRelationalValuePBS(d) {
  const target = actorNP(d.target, d.targetFilter, d.targetFilterMode, { plural: true })
  const subject = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const be = areIs(target.plural)
  return [
    { text: `${target.text} ${be} ${passiveBy(d.operator)} ${subject.text} ` },
    ...valueModifierSegments(d.subjectComparator, 'prior_board_state', undefined)
  ]
}

function composeRelationalValueDirect(d) {
  const subject = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const target = actorNP(d.target, d.targetFilter, d.targetFilterMode, { plural: true })
  const gerund = opForm(d.operator, 'gerund')
  const be = areIs(subject.plural)
  return [
    { text: `${subject.text} ${gerund} ${target.text} ${be} ` },
    ...valueModifierSegments(d.subjectComparator, d.subjectComparisonSource, d.subjectComparisonSourceTotal)
  ]
}

function composeRelationalTargetValueClause(d, { includePassive = true } = {}) {
  const target = actorNP(d.target, d.targetFilter, d.targetFilterMode, { plural: true })
  const subject = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const passivePart = includePassive ? ` ${passiveBy(d.operator)} ${subject.text}` : ''
  const be = areIs(target.plural)
  return [
    { text: `${target.text}${passivePart} ${be} ` },
    ...valueModifierSegments(d.targetComparator, d.targetComparisonSource, d.targetComparisonSourceTotal)
  ]
}

function composeRelationalSamePiece(d) {
  const key = [d.subject, d.target].sort().join('+')
  if (key === 'captured_piece+enemy_moved_piece') {
    const what = d.subjectFilter && d.subjectFilter !== 'any'
      ? noun(d.subjectFilter, d.subjectFilterMode, false)
      : 'piece'
    return [{ text: `I captured the ${what} the enemy just moved` }]
  }
  const subj = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode).text
  const tgt = actorNP(d.target, undefined, undefined).text
  return [{ text: `${subj} is the same piece as ${tgt}` }]
}

function composeRelational(d) {
  if (d.operator === 'same_piece') return composeRelationalSamePiece(d)
  const subjectMetric = d.subjectComparisonMetric
  const targetMetric = d.targetComparisonMetric
  const subjectIsValue = subjectMetric && subjectMetric !== 'count'
  const targetIsValue = targetMetric && targetMetric !== 'count'
  const subjectIsCount = subjectMetric === 'count'
  const targetIsCount = targetMetric === 'count'

  if ((subjectIsValue && (targetIsValue || targetIsCount)) || (subjectIsCount && targetIsValue)) {
    return composeRelationalIntegrated(d)
  }
  if (subjectIsValue) {
    return d.subjectComparisonSource === 'prior_board_state'
      ? composeRelationalValuePBS(d)
      : composeRelationalValueDirect(d)
  }
  if (targetIsValue) {
    return composeRelationalTargetValueClause(d, { includePassive: true })
  }
  return composeRelationalCountBranch(d)
}

function composeRelationalIntegrated(d) {
  // relational_mode locks the opposing comparison when one side uses prior_board_state, so neither side here is a prior_board_state source.
  const subjectSide = renderRelationalSideWithMetric(d, 'subject')
  const targetSide = renderRelationalSideWithMetric(d, 'target')
  const verbPair = opForm(d.operator, 'active')
  const gerund = opForm(d.operator, 'gerund')
  const subjectSense = singularCountSense(d, 'subject')
  const targetSense = singularCountSense(d, 'target')
  const negate = subjectSense === 'negate' || targetSense === 'negate'
  // Verb: continuous when subject NP has a value modifier (parenthetical),
  // simple when subject NP has a count quantifier or no modifier.
  let verb
  if (subjectSide.hasValueModifier) {
    const be = areIs(subjectSide.plural)
    verb = negate ? `${be} not ${gerund}` : `${be} ${gerund}`
  } else {
    verb = negate ? negatedVerb(d.operator, subjectSide.plural) : (subjectSide.plural ? verbPair[1] : verbPair[0])
  }
  const result = [
    ...subjectSide.segments,
    { text: ` ${verb} ` },
    ...targetSide.segments
  ]
  appendCountWarnings(result, subjectSense, targetSense)
  return result
}

function renderRelationalSideWithMetric(d, side) {
  const token = side === 'subject' ? d.subject : d.target
  const filter = side === 'subject' ? d.subjectFilter : d.targetFilter
  const filterMode = side === 'subject' ? d.subjectFilterMode : d.targetFilterMode
  const metric = side === 'subject' ? d.subjectComparisonMetric : d.targetComparisonMetric
  const comparator = side === 'subject' ? d.subjectComparator : d.targetComparator
  const source = side === 'subject' ? d.subjectComparisonSource : d.targetComparisonSource
  const total = side === 'subject' ? d.subjectComparisonSourceTotal : d.targetComparisonSourceTotal

  if (metric === 'count') {
    const info = quantifyCount({ comparator, source, total })
    const np = relationalSideNP(token, filter, filterMode, info)
    return { segments: np.segments, plural: np.plural, hasValueModifier: false }
  }
  if (metric) {
    const np = actorNP(token, filter, filterMode, { plural: true })
    const valSegs = valueModifierSegments(comparator, source, total)
    if (side === 'subject') {
      return {
        segments: [{ text: `${np.text}, ` }, ...valSegs, { text: ',' }],
        plural: np.plural,
        hasValueModifier: true
      }
    }
    return {
      segments: [{ text: `${np.text} ` }, ...valSegs],
      plural: np.plural,
      hasValueModifier: true
    }
  }
  const np = actorNP(token, filter, filterMode, { plural: side === 'target' })
  return { segments: [{ text: np.text }], plural: np.plural, hasValueModifier: false }
}

function composeRelationalCountBranch(d) {
  const subjectInfo = d.subjectComparisonMetric === 'count'
    ? quantifyCount({ comparator: d.subjectComparator, source: d.subjectComparisonSource, total: d.subjectComparisonSourceTotal })
    : null
  const targetInfo = d.targetComparisonMetric === 'count'
    ? quantifyCount({ comparator: d.targetComparator, source: d.targetComparisonSource, total: d.targetComparisonSourceTotal })
    : null
  const defaultSubjectInfo = (!subjectInfo && !targetInfo && !SINGULAR_ACTOR[d.subject])
    ? { q: 'at least one', atLeastOne: true } : null
  const effectiveSubjectInfo = subjectInfo || defaultSubjectInfo

  const verbPair = opForm(d.operator, 'active')

  if (subjectInfo?.same) {
    const targetNP = actorNP(d.target, d.targetFilter, d.targetFilterMode).text
    return [
      { text: 'the ' },
      { text: 'same number', emphasis: true },
      { text: ` of ${d.subject === 'allied' ? 'my' : 'enemy'} ${noun(d.subjectFilter, d.subjectFilterMode, true)} ${verbPair[1]} ${targetNP} as before` }
    ]
  }

  if (targetInfo?.same && isCollectionSubject(d.target)) {
    const subjectNP = relationalSideNP(d.subject, d.subjectFilter, d.subjectFilterMode, effectiveSubjectInfo)
    const verb = subjectNP.plural ? verbPair[1] : verbPair[0]
    return [
      ...subjectNP.segments,
      { text: ` ${verb} the ` },
      { text: 'same number', emphasis: true },
      { text: ` of ${d.target === 'allied' ? 'my' : 'enemy'} ${noun(d.targetFilter, d.targetFilterMode, true)} as before` }
    ]
  }

  const subjectNP = relationalSideNP(d.subject, d.subjectFilter, d.subjectFilterMode, effectiveSubjectInfo)
  const targetNP = relationalSideNP(d.target, d.targetFilter, d.targetFilterMode, targetInfo)
  const subjectSense = singularCountSense(d, 'subject')
  const targetSense = singularCountSense(d, 'target')
  const negate = subjectSense === 'negate' || targetSense === 'negate'
  const verb = negate ? negatedVerb(d.operator, subjectNP.plural) : (subjectNP.plural ? verbPair[1] : verbPair[0])

  const result = [
    ...subjectNP.segments,
    { text: ` ${verb} ` },
    ...targetNP.segments,
    { text: tail(subjectInfo) || tail(targetInfo) }
  ]
  appendCountWarnings(result, subjectSense, targetSense)
  return result
}

function composeCensusValueSingularSubject(d) {
  const subjectNP = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode).text
  if (d.target === 'exact_number') {
    return [
      { text: `${subjectNP} has value ` },
      { text: valueClause(d.comparator, Number(d.targetTotal)), emphasis: true }
    ]
  }
  return [
    { text: `${subjectNP} is ` },
    ...valueModifierSegments(d.comparator, d.target, undefined)
  ]
}

function composeCensusWhole(d) {
  if (d.operator === 'mobility') return composeCensusMobility(d)
  if (d.operator === 'value') return composeCensusValue(d)
  return composeCensusCount(d)
}

function composeCensusMobility(d) {
  const collection = isCollectionSubject(d.subject)
  const filtered = d.subjectFilter && d.subjectFilter !== 'any'
  const np = collection && !filtered
    ? { text: d.subject === 'enemy' ? 'enemy' : 'my pieces', plural: d.subject === 'allied' }
    : actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: collection })
  const verb = haveHas(np.plural)
  const info = quantifyCount({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  return [
    { text: `${np.text} ${verb} ` },
    { text: info.q, emphasis: true },
    { text: ` legal moves${tail(info)}` }
  ]
}

function composeCensusValue(d) {
  if (canUsePromotionIdiom(d)) return composeCensusValuePromotionIdiom(d)
  if (canUseCaptureIdiom(d)) return composeCensusValueCaptureIdiom(d)
  if (SINGULAR_ACTOR[d.subject]) return composeCensusValueSingularSubject(d)
  if (d.target === 'exact_number') return composeCensusValueCollectionExact(d)
  return composeCensusValueCollection(d) // target is PBS or a singular actor
}

function canUsePromotionIdiom(d) {
  return d.subject === 'allied'
    && (!d.subjectFilter || d.subjectFilter === 'any')
    && d.target === 'prior_board_state'
    && (d.comparator === 'greater_than' || d.comparator === 'less_than')
}

function canUseCaptureIdiom(d) {
  return d.subject === 'captured_piece'
    && d.target === 'enemy_captured_piece'
    && (!d.subjectFilter || d.subjectFilter === 'any')
}

function composeCensusValuePromotionIdiom(d) {
  const word = d.comparator === 'greater_than' ? 'promoted' : 'captured'
  const tail_ = d.comparator === 'greater_than' ? ' a pawn' : ' a piece'
  return [{ text: 'I ' }, { text: word, emphasis: true }, { text: tail_ }]
}

function composeCensusValueCaptureIdiom(d) {
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

function censusValueCollectionNP(d) {
  const filtered = d.subjectFilter && d.subjectFilter !== 'any'
  if (filtered) {
    return actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  }
  const poss = d.subject === 'enemy' ? "the enemy's" : 'my'
  return { text: `${poss} team`, plural: false }
}

function composeCensusValueCollection(d) {
  const np = censusValueCollectionNP(d)
  const be = areIs(np.plural)
  return [
    { text: `${np.text} ${be} ` },
    ...valueModifierSegments(d.comparator, d.target, undefined)
  ]
}

function composeCensusValueCollectionExact(d) {
  const np = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const verb = haveHas(np.plural)
  return [
    { text: `${np.text} ${verb} ` },
    { text: valueClause(d.comparator, Number(d.targetTotal)), emphasis: true },
    { text: ' total value' }
  ]
}

function composeCensusCount(d) {
  if (SINGULAR_ACTOR[d.subject]) return composeCensusCountSingularSubject(d)
  return composeCensusCountCollection(d)
}

// Singular-actor existence (=1/=0). `warn` for any other (gated-out) comparator.
function existenceWarn(d) {
  return [{ text: `${SINGULAR_ACTOR[d.subject]} ` }, { text: "⚠ couldn't render count comparison" }]
}

// "{actor} is {predicate}" (affirm) / "{actor} is not {predicate}" (negate)
function existenceSegments(actor, affirm, predicate) {
  return affirm
    ? [{ text: `${actor} ` }, { text: 'is', emphasis: true }, { text: ` ${predicate}` }]
    : [{ text: `${actor} is ` }, { text: 'not', emphasis: true }, { text: ` ${predicate}` }]
}

function composeCensusCountSingularSubject(d) {
  const sense = countExistenceSense(d.comparator, d.targetTotal)
  if (sense === 'warn') { return existenceWarn(d) }
  if (d.subjectFilter && d.subjectFilter !== 'any') {
    return existenceSegments(SINGULAR_ACTOR[d.subject], sense === 'affirm', `a ${speciesNoun(d.subjectFilter)}`)
  }
  return sense === 'affirm'
    ? [{ text: 'I ' }, { text: 'capture', emphasis: true }, { text: ' a piece' }]
    : [{ text: 'this move ' }, { text: 'captures nothing', emphasis: true }]
}

function composeCensusCountCollection(d) {
  const info = quantifyCount({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  const n = noun(d.subjectFilter, d.subjectFilterMode, !info.atLeastOne)
  return [
    { text: `${teamHas(d.subject)} ` },
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
  if (d.operator === 'mobility') return composeCensusRegionMobility(d)
  if (d.operator === 'value') return composeCensusRegionValue(d)
  return composeCensusRegionCount(d)
}

function regionText(region) { return `${region.prefix}${region.bound}` }

// "{lead} the **same number** of {unit} as {ref}" (equal_to)
// "{lead} **{deltaWord}** {unit} than {ref}"        (otherwise)
function comparisonVsSingular(lead, comparator, unit, ref) {
  if (comparator === 'equal_to') {
    return [
      { text: `${lead} the ` },
      { text: 'same number', emphasis: true },
      { text: ` of ${unit} as ${ref}` }
    ]
  }
  return [
    { text: `${lead} ` },
    { text: deltaCountWord(comparator), emphasis: true },
    { text: ` ${unit} than ${ref}` }
  ]
}

function composeCensusRegionCountSingularSubject(d) {
  const sense = countExistenceSense(d.comparator, d.targetTotal)
  if (sense === 'warn') { return existenceWarn(d) }
  const where = regionText(regionPhrase(d))
  const filtered = d.subjectFilter && d.subjectFilter !== 'any'
  const predicate = filtered ? `a ${speciesNoun(d.subjectFilter)} ${where}` : where
  return existenceSegments(SINGULAR_ACTOR[d.subject], sense === 'affirm', predicate)
}

function composeCensusRegionCount(d) {
  if (SINGULAR_ACTOR[d.subject]) { return composeCensusRegionCountSingularSubject(d) }
  const region = regionPhrase(d)
  if (SINGULAR_ACTOR[d.target]) { return composeCensusRegionCountVsSingular(d) }
  if (d.target === 'prior_board_state') {
    const info = quantifyCount({ comparator: d.comparator, source: 'prior_board_state' })
    const group = d.subject === 'allied'
      ? `of my ${noun(d.subjectFilter, d.subjectFilterMode, true)}`
      : `enemy ${noun(d.subjectFilter, d.subjectFilterMode, true)}`
    return [
      { text: info.q, emphasis: true },
      { text: ` ${group} are ${regionText(region)} than before` }
    ]
  }
  const info = quantifyCount({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  const n = noun(d.subjectFilter, d.subjectFilterMode, !info.atLeastOne)
  return [
    { text: `${teamHas(d.subject)} ${info.q} ${n} ${region.prefix}` },
    { text: region.bound, emphasis: true }
  ]
}

function composeCensusRegionCountVsSingular(d) {
  const unit = `${noun(d.subjectFilter, d.subjectFilterMode, true)} ${regionText(regionPhrase(d))}`
  return comparisonVsSingular(teamHas(d.subject), d.comparator, unit, SINGULAR_ACTOR[d.target])
}

function composeCensusRegionMobility(d) {
  const region = regionPhrase(d)
  if (SINGULAR_ACTOR[d.target]) { return composeCensusRegionMobilityVsSingular(d) }
  const np = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const verb = haveHas(np.plural)
  const info = quantifyCount({ comparator: d.comparator, source: d.target, total: d.targetTotal })
  return [
    { text: `${np.text} ${regionText(region)} ${verb} ` },
    { text: info.q, emphasis: true },
    { text: ` legal moves${tail(info)}` }
  ]
}

function composeCensusRegionMobilityVsSingular(d) {
  const np = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  const lead = `${np.text} ${regionText(regionPhrase(d))} ${haveHas(np.plural)}`
  return comparisonVsSingular(lead, d.comparator, 'legal moves', SINGULAR_ACTOR[d.target])
}

function composeCensusRegionValue(d) {
  const region = regionPhrase(d)
  const np = actorNP(d.subject, d.subjectFilter, d.subjectFilterMode, { plural: true })
  if (d.target === 'prior_board_state') {
    return [
      { text: `${np.text} ${regionText(region)} ${areIs(np.plural)} ` },
      ...valueModifierSegments(d.comparator, 'prior_board_state', undefined)
    ]
  }
  if (SINGULAR_ACTOR[d.target]) {
    const n = noun(d.subjectFilter, d.subjectFilterMode, false)
    return [
      { text: `${teamHas(d.subject)} at least one ${n} ${regionText(region)} ` },
      ...valueModifierSegments(d.comparator, d.target, undefined)
    ]
  }
  return [
    { text: `${np.text} ${regionText(region)} ${haveHas(np.plural)} ` },
    { text: valueClause(d.comparator, Number(d.targetTotal)), emphasis: true },
    { text: ' total value' }
  ]
}

const PREVIEW_MODE_KEY = 'conditionPreviewMode'

export function getConditionPreviewMode() {
  if (typeof window === 'undefined' || !window.localStorage) return 'sentence'
  return window.localStorage.getItem(PREVIEW_MODE_KEY) === 'chunks' ? 'chunks' : 'sentence'
}

export function setConditionPreviewMode(mode) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(PREVIEW_MODE_KEY, mode === 'chunks' ? 'chunks' : 'sentence')
}

export function formatConditionSentence(nodeData = {}) {
  if (getConditionPreviewMode() === 'chunks') {
    return [{ text: formatConditionPreview(nodeData).text }]
  }
  const spec = sentenceSpec()[nodeData.kind]
  if (!spec) { return [{ text: '[invalid condition]' }] }
  const chunks = sentenceDescriptors(spec, nodeData).map(dscr => buildSentenceChunk(dscr, nodeData))
  const signature = chunks.map(c => c.role).join('|')
  // The operator can be a spec const (identity → 'same_piece') absent from the
  // raw payload, so read it from the assembled chunk rather than nodeData.
  const operatorChunk = chunks.find(c => c.role === 'operator')
  const d = operatorChunk ? { ...nodeData, operator: operatorChunk.operator } : nodeData
  switch (signature) {
    case 'side|operator|side': return composeRelational(d)
    case 'side|operator|comparison': return composeCensusWhole(d)
    case 'side|region|metric': return composeCensusRegion(d)
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
