import Board from "gameplay/board"
import { formatConditionPreview } from "editorV2/utils/conditionPreviewFormatter"

class ReplayTraceView {
  constructor({ tracePanelElement, traceSummaryElement, traceBranchesElement }) {
    this.tracePanelElement = tracePanelElement
    this.traceSummaryElement = traceSummaryElement
    this.traceBranchesElement = traceBranchesElement
  }

  render(inspection) {
    if (!this.tracePanelElement || !this.traceSummaryElement || !this.traceBranchesElement) { return }

    if (!inspection?.enabled || !inspection.result?.selectedTrace) {
      this.tracePanelElement.hidden = true
      this.traceSummaryElement.innerHTML = ""
      this.traceBranchesElement.innerHTML = ""
      return
    }

    this.tracePanelElement.hidden = false
    this.renderSummary(inspection)
    this.renderBranches(inspection)
  }

  renderSummary(inspection) {
    const { result } = inspection
    const selectedMove = result.selectedMove?.moveObject
    const selectedNotation = selectedMove ? Board.gridCalculator(selectedMove.endPosition) : "none"
    const tiedTopCount = result.tiedTopMoveKeys.length
    const selectedTied = result.currentChoiceKey && result.tiedTopMoveKeys.includes(result.currentChoiceKey)

    this.traceSummaryElement.innerHTML = ""

    const summaryRow = document.createElement("div")
    summaryRow.className = "match-replay-trace-summary-row"

    const heading = document.createElement("span")
    heading.className = "match-replay-trace-heading"
    heading.innerText = "why this move"
    summaryRow.appendChild(heading)

    const score = document.createElement("span")
    score.className = "match-replay-trace-score"
    score.innerText = `score ${result.selectedTrace.score}`
    summaryRow.appendChild(score)

    const moveSummary = document.createElement("span")
    moveSummary.className = "match-replay-trace-meta"
    moveSummary.innerText = result.explicitSelectedMoveKey
      ? `selected move: ${Board.gridCalculator(selectedMove.startPosition)} to ${selectedNotation}`
      : `current choice: ${Board.gridCalculator(selectedMove.startPosition)} to ${selectedNotation}`
    summaryRow.appendChild(moveSummary)

    if (tiedTopCount > 1 && selectedTied) {
      const tieSummary = document.createElement("span")
      tieSummary.className = "match-replay-trace-meta"
      tieSummary.innerText = `tied top moves: ${tiedTopCount}`
      summaryRow.appendChild(tieSummary)
    }

    this.traceSummaryElement.appendChild(summaryRow)
  }

  renderBranches(inspection) {
    this.traceBranchesElement.innerHTML = ""

    const groupedBranches = this.groupByBranch({
      compiledProgram: inspection.compiledProgram,
      trace: inspection.result.selectedTrace.trace
    })

    groupedBranches.forEach(branch => {
      if (branch.entries.length === 0) { return }

      const branchElement = document.createElement("section")
      branchElement.className = "match-replay-trace-branch"

      const heading = document.createElement("h4")
      heading.className = "match-replay-trace-branch-heading"
      heading.innerText = branch.label
      branchElement.appendChild(heading)

      branch.entries.forEach(entry => {
        branchElement.appendChild(this.traceEntryElement(entry))
      })

      this.traceBranchesElement.appendChild(branchElement)
    })
  }

  groupByBranch({ compiledProgram, trace }) {
    if (!compiledProgram?.nodes || !compiledProgram.root) { return [] }

    const rootNode = compiledProgram.nodes[compiledProgram.root]
    const branchIds = rootNode?.children || []

    return branchIds.map((branchId, index) => {
      const subtreeIds = this.collectSubtreeIds({ compiledProgram, nodeId: branchId })
      return {
        label: `branch ${index + 1}`,
        entries: trace.filter(entry => subtreeIds.has(entry.nodeId))
      }
    })
  }

  collectSubtreeIds({ compiledProgram, nodeId, collected = new Set() }) {
    if (!nodeId || collected.has(nodeId)) { return collected }

    collected.add(nodeId)
    const node = compiledProgram.nodes[nodeId]
    const children = node?.children || []
    children.forEach(childId => this.collectSubtreeIds({ compiledProgram, nodeId: childId, collected }))
    return collected
  }

  traceEntryElement(entry) {
    const row = document.createElement("div")
    row.className = "match-replay-trace-entry"
    const meta = document.createElement("div")
    meta.className = "match-replay-trace-entry-meta"
    const typePill = document.createElement("span")
    typePill.className = "match-replay-trace-pill match-replay-trace-pill--type"
    typePill.innerText = entry.nodeType
    meta.appendChild(typePill)
    
    if (entry.nodeType === 'condition') {
      row.classList.add('match-replay-trace-entry--condition')
      row.classList.add(entry.passed ? 'match-replay-trace-entry--pass' : 'match-replay-trace-entry--fail')
      const statusPill = document.createElement("span")
      statusPill.className = `match-replay-trace-pill ${entry.passed ? 'match-replay-trace-pill--pass' : 'match-replay-trace-pill--fail'}`
      statusPill.innerText = entry.passed ? 'true' : 'false'
      meta.appendChild(statusPill)
      row.appendChild(meta)

      const body = document.createElement("div")
      body.className = "match-replay-trace-entry-body"
      body.innerText = this.conditionSummary(entry.data)
      row.appendChild(body)
      return row
    }

    row.classList.add('match-replay-trace-entry--action')
    row.classList.add(entry.halted ? 'match-replay-trace-entry--action-halted' : 'match-replay-trace-entry--action-applied')
    const statusPill = document.createElement("span")
    statusPill.className = "match-replay-trace-pill match-replay-trace-pill--action"
    statusPill.innerText = entry.halted ? 'halt' : 'applied'
    meta.appendChild(statusPill)
    row.appendChild(meta)

    const body = document.createElement("div")
    body.className = "match-replay-trace-entry-body"
    body.innerText = `${entry.actionType} ${entry.value}`
    row.appendChild(body)

    const scoreMeta = document.createElement("div")
    scoreMeta.className = "match-replay-trace-entry-score"
    scoreMeta.innerText = `score ${entry.scoreBefore} -> ${entry.scoreAfter}`
    row.appendChild(scoreMeta)
    return row
  }

  conditionSummary(data) {
    if (Number(data.version || 1) === 2) {
      return formatConditionPreview(data).text
    }

    const relationLabel = this.relationLabel(data.relation)
    const relationSpecifier = data.relationSpecifier && data.relationSpecifier !== 'any'
      ? ` ${this.specifierSummary(data.relationSpecifier, data.relationSpecifierMode)}`
      : ''
    const subjectSpecifier = data.subjectSpecifier && data.subjectSpecifier !== 'any'
      ? ` ${this.specifierSummary(data.subjectSpecifier, data.subjectSpecifierMode)}`
      : ''
    const comparisonValue = typeof data.comparisonValue === 'number'
      ? data.comparisonValue
      : this.prettyToken(data.comparisonValue)
    const operator = {
      equal_to: '=',
      greater_than: '>',
      less_than: '<'
    }[data.comparison] || data.comparison

    return `${this.prettyToken(data.subject)}${subjectSpecifier} ${relationLabel}${relationSpecifier} ${operator} ${comparisonValue}`
  }

  relationLabel(relation) {
    return {
      attacker: 'is ATTACKED by',
      attacked: 'makes ATTACKS against',
      defender: 'is DEFENDED by',
      defended: 'provides DEFENSE for',
      shielder: 'is SHIELDED by',
      shielded: 'provides SHIELDING for',
      coverer: 'is COVERED by',
      covered: 'provides COVER for'
    }[relation] || this.prettyToken(relation)
  }

  prettyToken(value) {
    return String(value).replaceAll('_', ' ')
  }

  specifierSummary(specifier, mode) {
    const label = this.prettyToken(specifier)
    return mode === 'exclude' ? `non-${label}` : label
  }
}

export default ReplayTraceView
