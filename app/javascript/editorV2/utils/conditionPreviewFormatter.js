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

export function formatConditionPreview(nodeData = {}) {
  if (nodeData.kind === 'census') {
    const hasRegion = nodeData.positionAxis !== undefined && nodeData.positionAxis !== null
    const left = subjectPreview(nodeData.subject, nodeData.subjectFilter || 'any', nodeData.subjectFilterMode || 'include')
    const preview = hasRegion
      ? {
          left,
          operator: positionAxisPreview(nodeData.positionAxis, nodeData.positionComparator, nodeData.positionTarget),
          right: `${operatorLabel(nodeData.operator)} ${comparatorLabel(nodeData.comparator)} ${nodeData.targetTotal}`
        }
      : {
          left,
          operator: operatorLabel(nodeData.operator),
          right: unaryTargetComparisonPreview({
            comparator: nodeData.comparator,
            target: nodeData.target,
            targetFilter: nodeData.targetFilter,
            targetFilterMode: nodeData.targetFilterMode,
            targetTotal: nodeData.targetTotal
          })
        }
    preview.text = previewText(preview)
    return preview
  }

  if (nodeData.kind === 'identity') {
    const preview = {
      left: subjectPreview(nodeData.subject, 'any', 'include'),
      operator: operatorPreviewText('same_piece'),
      right: subjectPreview(nodeData.target, 'any', 'include')
    }
    preview.text = previewText(preview)
    return preview
  }

  if (nodeData.kind === 'relational') {
    const preview = {
      left: sidePreview({
        subject: nodeData.subject,
        filter: nodeData.subjectFilter || 'any',
        filterMode: nodeData.subjectFilterMode || 'include',
        comparisonMetric: nodeData.subjectComparisonMetric,
        comparator: nodeData.subjectComparator,
        comparisonSource: nodeData.subjectComparisonSource,
        comparisonSourceTotal: nodeData.subjectComparisonSourceTotal
      }),
      operator: operatorPreviewText(nodeData.operator),
      right: sidePreview({
        subject: nodeData.target,
        filter: nodeData.targetFilter || 'any',
        filterMode: nodeData.targetFilterMode || 'include',
        comparisonMetric: nodeData.targetComparisonMetric,
        comparator: nodeData.targetComparator,
        comparisonSource: nodeData.targetComparisonSource,
        comparisonSourceTotal: nodeData.targetComparisonSourceTotal
      })
    }
    preview.text = previewText(preview)
    return preview
  }

  const preview = {
    left: subjectPreview(nodeData.subject, nodeData.subjectFilter || 'any', nodeData.subjectFilterMode || 'include'),
    operator: operatorLabel(nodeData.operator),
    right: unaryTargetComparisonPreview({
      comparator: nodeData.comparator,
      target: nodeData.target,
      targetFilter: nodeData.targetFilter,
      targetFilterMode: nodeData.targetFilterMode,
      targetTotal: nodeData.targetTotal
    })
  }
  preview.text = previewText(preview)
  return preview
}

export function formatConditionPreviewChunk(chunk) {
  switch (chunk.role) {
    case 'side':
      return sidePreview(chunk)
    case 'operator':
      return operatorPreviewText(chunk.operator)
    case 'comparison':
      return unaryTargetComparisonPreview(chunk)
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
    text: element.textContent
  }
}

export function formatConditionPreviewElement(element) {
  if (!element) { return }
  element.querySelectorAll('.condition-preview__chunk[data-condition-preview-role]').forEach((chunkElement) => {
    chunkElement.textContent = formatConditionPreviewChunk(parseChunkDataset(chunkElement))
  })
}
