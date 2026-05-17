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
