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
    default:
      return comparator
  }
}

function comparisonValuePreview(comparisonValue, comparisonValueNumber) {
  if (comparisonValue === undefined || comparisonValue === null || comparisonValue === '') {
    return ''
  }
  if (comparisonValue === 'exact_number') {
    return String(comparisonValueNumber)
  }
  switch (comparisonValue) {
    case 'moved_piece_value':
      return 'Moved Piece Value'
    case 'captured_piece_value':
      return 'Captured Piece Value'
    case 'enemy_moved_piece_value':
      return 'Enemy Moved Piece Value'
    case 'enemy_captured_piece_value':
      return 'Enemy Captured Piece Value'
    case 'prior_board_state':
      return 'Prior Board State'
    default:
      return String(comparisonValue)
  }
}

function sideComparisonPreview({ comparisonMetric, comparator, comparisonValue, comparisonValueNumber, comparisonOpen = true }) {
  if (!comparisonOpen || !comparisonMetric) { return '' }
  return `${metricLabel(comparisonMetric)} ${comparatorLabel(comparator)} ${comparisonValuePreview(comparisonValue, comparisonValueNumber)}`
}

function sidePreview({ subject, filter, filterMode, comparisonMetric, comparator, comparisonValue, comparisonValueNumber, comparisonOpen = true }) {
  const base = subjectPreview(subject, filter, filterMode)
  const comparison = sideComparisonPreview({ comparisonMetric, comparator, comparisonValue, comparisonValueNumber, comparisonOpen })
  return comparison ? `${base} (${comparison})` : base
}

function unaryComparisonPreview({ comparator, comparisonValue, comparisonValueNumber }) {
  return `${comparatorLabel(comparator)} ${comparisonValuePreview(comparisonValue, comparisonValueNumber)}`
}

export function formatConditionPreviewState(state) {
  if (state.kind === 'relational') {
    return `${sidePreview({
      subject: state.left.subject,
      filter: state.left.filter,
      filterMode: state.left.filterMode,
      comparisonMetric: state.left.comparisonMetric,
      comparator: state.left.comparator,
      comparisonValue: state.left.comparisonValueSource,
      comparisonValueNumber: state.left.comparisonValueNumber,
      comparisonOpen: state.ui.leftComparisonOpen
    })} : ${operatorPreviewText(state.operator)} : ${sidePreview({
      subject: state.right.subject,
      filter: state.right.filter,
      filterMode: state.right.filterMode,
      comparisonMetric: state.right.comparisonMetric,
      comparator: state.right.comparator,
      comparisonValue: state.right.comparisonValueSource,
      comparisonValueNumber: state.right.comparisonValueNumber,
      comparisonOpen: state.ui.rightComparisonOpen
    })}`
  }

  return `${subjectPreview(state.left.subject, state.left.filter, state.left.filterMode)} : ${operatorLabel(state.operator)} : ${unaryComparisonPreview({
    comparator: state.unary.comparator,
    comparisonValue: state.unary.comparisonValueSource,
    comparisonValueNumber: state.unary.comparisonValueNumber
  })}`
}

export function formatConditionPreviewChunk(chunk) {
  switch (chunk.role) {
    case 'side':
      return sidePreview(chunk)
    case 'operator':
      return operatorPreviewText(chunk.operator)
    case 'comparison':
      return unaryComparisonPreview(chunk)
    default:
      return chunk.text || ''
  }
}

function parseBoolean(value) {
  return value === 'true'
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
    comparisonValue: dataset.conditionPreviewComparisonValue,
    comparisonValueNumber: dataset.conditionPreviewComparisonValueNumber,
    comparisonOpen: parseBoolean(dataset.conditionPreviewComparisonOpen),
    operator: dataset.conditionPreviewOperator,
    text: element.textContent
  }
}

export function formatConditionPreviewElement(element) {
  if (!element) { return }
  element.querySelectorAll('.condition-preview__chunk[data-condition-preview-role]').forEach((chunkElement) => {
    chunkElement.textContent = formatConditionPreviewChunk(parseChunkDataset(chunkElement))
  })
}
