import { Controller } from "@hotwired/stimulus"

const SUBJECT_OPTIONS = [
  ["Allies", "allies"],
  ["Opponents", "opponents"],
  ["Moved Piece", "moved_piece"],
  ["Captured Piece", "captured_piece"]
]

const SPECIFIER_OPTIONS = [
  ["Any", "any"],
  ["Pawn", "pawn"],
  ["Bishop", "bishop"],
  ["Knight", "knight"],
  ["Rook", "rook"],
  ["Queen", "queen"],
  ["King", "king"]
]

const SPECIFIER_MODE_OPTIONS = [
  ["Is", "include"],
  ["Is Not", "exclude"]
]

const RELATION_OPTIONS = [
  ["Attack", "attack"],
  ["Defend", "defend"],
  ["Cover", "cover"],
  ["Shield", "shield"],
  ["Adjacent", "adjacent"]
]

const UNARY_VERB_OPTIONS = [
  ["Count", "count"],
  ["Mobility", "mobility"],
  ["Value", "value"]
]

const COMPARISON_METRIC_OPTIONS = [
  ["Count", "count"],
  ["Value", "value"]
]

const COMPARISON_OPTIONS = [
  ["=", "equal_to"],
  [">", "greater_than"],
  ["<", "less_than"]
]

const COMPARISON_VALUE_OPTIONS = [
  ["Number", "exact_number"],
  ["Moved Piece Value", "moved_piece_value"],
  ["Captured Piece Value", "captured_piece_value"],
  ["Prior Board State", "prior_board_state"]
]

const DEFAULT_STATE = Object.freeze({
  kind: "relation",
  left: {
    subject: "allies",
    specifier: "pawn",
    specifierMode: "include",
    comparisonMetric: "",
    comparison: "equal_to",
    comparisonValueSource: "exact_number",
    comparisonValueNumber: 2
  },
  relation: "attack",
  right: {
    subject: "opponents",
    specifier: "bishop",
    specifierMode: "include",
    comparisonMetric: "",
    comparison: "equal_to",
    comparisonValueSource: "exact_number",
    comparisonValueNumber: 1
  },
  unary: {
    subject: "moved_piece",
    specifier: "queen",
    specifierMode: "include",
    verb: "count",
    comparison: "greater_than",
    comparisonValueSource: "exact_number",
    comparisonValueNumber: 0
  },
  ui: {
    leftComparisonOpen: false,
    rightComparisonOpen: false
  }
})

export default class extends Controller {
  static targets = [
    "editorPanel",
    "fakeNode",
    "nodePreview",
    "verbSelector",
    "rightCard",
    "rightCardLabel",
    "rightRelationFields",
    "leftComparisonSection",
    "unaryComparisonSection",
    "priorNote",
    "leftSubject",
    "leftSpecifier",
    "leftSpecifierMode",
    "leftMetric",
    "leftComparison",
    "leftComparisonValueSource",
    "leftComparisonValueNumber",
    "leftComparisonRow",
    "leftComparisonToggle",
    "leftComparisonBody",
    "rightSubject",
    "rightSpecifier",
    "rightSpecifierMode",
    "rightMetric",
    "rightComparison",
    "rightComparisonValueSource",
    "rightComparisonValueNumber",
    "rightComparisonToggle",
    "rightComparisonBody",
    "unaryComparison",
    "unaryComparisonValueSource",
    "unaryComparisonValueNumber",
    "unaryComparisonRow",
    "formulationPreview"
  ]

  connect() {
    this.state = structuredClone(DEFAULT_STATE)
    this.renderAll()
  }

  handleNodeClick() {
    this.fakeNodeTarget.classList.add("selected")
    this.editorPanelTarget.classList.remove("hidden")
  }

  changeVerbFamily() {
    const value = this.verbSelectorTarget.value
    this.state.kind = RELATION_OPTIONS.some(([, option]) => option === value) ? "relation" : "unary"
    if (this.state.kind === "relation") {
      this.state.relation = value
    } else {
      this.state.unary.verb = value
      this.state.ui.rightComparisonOpen = false
    }
    this.renderAll()
  }

  toggleComparison(event) {
    const side = event.currentTarget.dataset.side
    const key = side === "left" ? "leftComparisonOpen" : "rightComparisonOpen"

    if (side === "right" && this.state.kind !== "relation") return
    if (this.comparisonLocked(side)) return

    const sideState = this.state[side]
    const currentlyOpen = this.state.ui[key]

    if (!currentlyOpen && this.state.kind === "relation" && !sideState.comparisonMetric) {
      sideState.comparisonMetric = "count"
      sideState.comparison = "equal_to"
      sideState.comparisonValueSource = "exact_number"
      sideState.comparisonValueNumber ||= 1
    }

    this.state.ui[key] = !currentlyOpen
    this.renderAll()
  }

  updateField(event) {
    let path = event.target.dataset.path
    if (!path) return

    if (this.state.kind !== "relation" && path.startsWith("left.")) {
      path = path.replace(/^left\./, "unary.")
    }

    const value = event.target.type === "number" ? Number(event.target.value || 0) : event.target.value
    this.assignPath(path, value)
    this.renderAll()
  }

  renderAll() {
    this.renderSelectOptions()
    this.applyCompatibilityRules()
    this.renderFieldValues()
    this.renderVisibility()
    this.renderComparisonState("left")
    this.renderComparisonState("right")
    this.renderPreview()
    this.renderFormulationPreview()
    this.renderPriorNote()
  }

  renderSelectOptions() {
    this.renderOptions(this.leftSubjectTarget, SUBJECT_OPTIONS)
    this.renderOptions(this.rightSubjectTarget, SUBJECT_OPTIONS.filter(([, value]) => value !== "captured_piece"))

    this.renderOptions(this.leftSpecifierTarget, SPECIFIER_OPTIONS)
    this.renderOptions(this.rightSpecifierTarget, SPECIFIER_OPTIONS)

    this.renderOptions(this.leftSpecifierModeTarget, SPECIFIER_MODE_OPTIONS)
    this.renderOptions(this.rightSpecifierModeTarget, SPECIFIER_MODE_OPTIONS)

    this.renderOptions(this.verbSelectorTarget, [...RELATION_OPTIONS, ...UNARY_VERB_OPTIONS])

    this.renderOptions(this.leftMetricTarget, COMPARISON_METRIC_OPTIONS)
    this.renderOptions(this.rightMetricTarget, COMPARISON_METRIC_OPTIONS)
    this.renderOptions(this.leftComparisonTarget, COMPARISON_OPTIONS)
    this.renderOptions(this.rightComparisonTarget, COMPARISON_OPTIONS)
    this.renderOptions(this.unaryComparisonTarget, COMPARISON_OPTIONS)

    this.renderOptions(this.leftComparisonValueSourceTarget, COMPARISON_VALUE_OPTIONS)
    this.renderOptions(this.rightComparisonValueSourceTarget, COMPARISON_VALUE_OPTIONS)
    this.renderOptions(this.unaryComparisonValueSourceTarget, COMPARISON_VALUE_OPTIONS)
  }

  renderOptions(select, options) {
    if (select.dataset.optionsInitialized === "true") return
    select.innerHTML = options.map(([label, value]) => `<option value="${value}">${label}</option>`).join("")
    select.dataset.optionsInitialized = "true"
  }

  applyCompatibilityRules() {
    if (this.state.kind !== "relation") return

    if (this.state.right.subject === "captured_piece") {
      this.state.right.subject = "opponents"
    }

    const leftPrior = this.leftUsesPrior()
    const rightPrior = this.rightUsesPrior()

    if (leftPrior) {
      this.clearComparator("right")
      this.state.ui.rightComparisonOpen = false
    }

    if (rightPrior) {
      this.clearComparator("left")
      this.state.ui.leftComparisonOpen = false
    }
  }

  renderFieldValues() {
    this.verbSelectorTarget.value = this.state.kind === "relation" ? this.state.relation : this.state.unary.verb

    this.leftSubjectTarget.value = this.state.kind === "relation" ? this.state.left.subject : this.state.unary.subject
    this.leftSpecifierTarget.value = this.state.kind === "relation" ? this.state.left.specifier : this.state.unary.specifier
    this.leftSpecifierModeTarget.value = this.state.kind === "relation" ? this.state.left.specifierMode : this.state.unary.specifierMode
    this.leftMetricTarget.value = this.state.left.comparisonMetric || "count"
    this.leftComparisonTarget.value = this.state.kind === "relation" ? this.state.left.comparison : this.state.unary.comparison
    this.leftComparisonValueSourceTarget.value = this.state.kind === "relation"
      ? this.state.left.comparisonValueSource
      : this.state.unary.comparisonValueSource
    this.leftComparisonValueNumberTarget.value = this.state.kind === "relation"
      ? this.state.left.comparisonValueNumber
      : this.state.unary.comparisonValueNumber

    this.rightSubjectTarget.value = this.state.right.subject
    this.rightSpecifierTarget.value = this.state.right.specifier
    this.rightSpecifierModeTarget.value = this.state.right.specifierMode
    this.rightMetricTarget.value = this.state.right.comparisonMetric || "count"
    this.rightComparisonTarget.value = this.state.right.comparison || "equal_to"
    this.rightComparisonValueSourceTarget.value = this.state.right.comparisonValueSource
    this.rightComparisonValueNumberTarget.value = this.state.right.comparisonValueNumber
    this.unaryComparisonTarget.value = this.state.unary.comparison
    this.unaryComparisonValueSourceTarget.value = this.state.unary.comparisonValueSource
    this.unaryComparisonValueNumberTarget.value = this.state.unary.comparisonValueNumber
  }

  renderVisibility() {
    const relationMode = this.state.kind === "relation"
    const leftNumber = this.leftComparisonValueSourceTarget.value === "exact_number"
    const rightNumber = this.rightComparisonValueSourceTarget.value === "exact_number"
    const unaryNumber = this.unaryComparisonValueSourceTarget.value === "exact_number"

    this.rightCardLabelTarget.textContent = relationMode ? "Relation" : "Comparison"
    this.rightRelationFieldsTarget.classList.toggle("hidden", !relationMode)
    this.leftComparisonSectionTarget.classList.toggle("hidden", !relationMode)
    this.unaryComparisonSectionTarget.classList.toggle("hidden", relationMode)

    this.leftComparisonValueNumberTarget.classList.toggle(
      "hidden",
      !leftNumber
    )
    this.leftMetricTarget.classList.toggle("hidden", this.state.kind !== "relation")

    this.rightComparisonValueNumberTarget.classList.toggle(
      "hidden",
      !rightNumber
    )
    this.unaryComparisonValueNumberTarget.classList.toggle(
      "hidden",
      !unaryNumber
    )

    this.setControlsDisabled(
      [
        this.unaryComparisonTarget,
        this.unaryComparisonValueSourceTarget,
        this.unaryComparisonValueNumberTarget
      ],
      relationMode
    )
    this.unaryComparisonValueNumberTarget.disabled = relationMode || !unaryNumber
  }

  renderComparisonState(side) {
    const sideState = side === "left"
      ? (this.state.kind === "relation" ? this.state.left : this.state.unary)
      : this.state.right

    const openKey = side === "left" ? "leftComparisonOpen" : "rightComparisonOpen"
    const bodyTarget = side === "left" ? this.leftComparisonBodyTarget : this.rightComparisonBodyTarget
    const toggleTarget = side === "left" ? this.leftComparisonToggleTarget : this.rightComparisonToggleTarget
    const locked = this.comparisonLocked(side)
    const hasComparison = side === "left" && this.state.kind !== "relation"
      ? true
      : Boolean(sideState.comparisonMetric)
    const open = side === "right" && this.state.kind !== "relation" ? false : this.state.ui[openKey]

    if (side === "left" && this.state.kind !== "relation") {
      bodyTarget.classList.add("hidden")
      toggleTarget.classList.add("hidden")
      this.setControlsDisabled(
        [
          this.leftMetricTarget,
          this.leftComparisonTarget,
          this.leftComparisonValueSourceTarget,
          this.leftComparisonValueNumberTarget
        ],
        true
      )
      return
    }

    bodyTarget.classList.toggle("hidden", !open || locked)
    toggleTarget.classList.remove("hidden")
    toggleTarget.disabled = locked
    toggleTarget.textContent = this.comparisonToggleText(side, sideState, hasComparison, open, locked)

    if (side === "left") {
      this.setControlsDisabled(
        [
          this.leftMetricTarget,
          this.leftComparisonTarget,
          this.leftComparisonValueSourceTarget,
          this.leftComparisonValueNumberTarget
        ],
        !open || locked
      )
      this.leftComparisonValueNumberTarget.disabled = !open || locked || this.leftComparisonValueSourceTarget.value !== "exact_number"
      return
    }

    this.setControlsDisabled(
      [
        this.rightMetricTarget,
        this.rightComparisonTarget,
        this.rightComparisonValueSourceTarget,
        this.rightComparisonValueNumberTarget
      ],
      !open || locked
    )
    this.rightComparisonValueNumberTarget.disabled = !open || locked || this.rightComparisonValueSourceTarget.value !== "exact_number"
  }

  renderPreview() {
    const chunks = this.previewChunks()

    this.nodePreviewTarget.innerHTML = chunks
      .map(line => line === ""
        ? `<div class="condition-preview__chunk condition-preview__chunk--spacer"></div>`
        : `<div class="condition-preview__chunk">${line}</div>`)
      .join("")
  }

  renderFormulationPreview() {
    this.formulationPreviewTarget.textContent = this.state.kind === "relation"
      ? this.relationSummary()
      : this.unarySummary()
  }

  renderPriorNote() {
    this.priorNoteTarget.textContent = this.priorNote()
    this.priorNoteTarget.classList.toggle("hidden", this.priorNoteTarget.textContent === "")
  }

  previewChunks() {
    if (this.state.kind === "relation") {
      const chunks = [
        this.sideSummary(this.state.left, { comparisonActive: this.leftComparisonActive() }),
        "",
        this.relationLabel(this.state.relation),
        "",
        this.sideSummary(this.state.right, { comparisonActive: this.rightComparisonActive() })
      ]

      if (this.priorNote()) {
        chunks.push("", this.priorNote())
      }

      return chunks
    }

    const unary = this.state.unary
    return [
      this.sideSummary(unary),
      "",
      unary.verb,
      "",
      `${this.operatorLabel(unary.comparison)} ${this.valueLabel(unary.comparisonValueSource, unary.comparisonValueNumber)}`
    ]
  }

  relationSummary() {
    const spacer = "   :   "
    return [
      `${this.sideSummary(this.state.left, { comparisonActive: this.leftComparisonActive() })}${spacer}${this.relationLabel(this.state.relation)}${spacer}${this.sideSummary(this.state.right, { comparisonActive: this.rightComparisonActive() })}`,
      this.priorNote()
    ].filter(Boolean).join("\n")
  }

  unarySummary() {
    const unary = this.state.unary
    const spacer = "   :   "
    return `${this.sideSummary(unary)}${spacer}${unary.verb}${spacer}${this.operatorLabel(unary.comparison)} ${this.valueLabel(unary.comparisonValueSource, unary.comparisonValueNumber)}`
  }

  sideSummary(side, options = {}) {
    const comparisonActive = options.comparisonActive ?? Boolean(side.comparisonMetric)
    const qualifier = this.specifierPhrase(side.specifierMode, side.specifier)
    const pieces = qualifier
      ? `${this.subjectLabel(side.subject)} ${qualifier}`
      : `${this.subjectLabel(side.subject)}`

    if (!comparisonActive || !side.comparisonMetric) return pieces

    const comparisonParts = [
      side.comparisonMetric,
      this.operatorLabel(side.comparison),
      this.valueLabel(side.comparisonValueSource, side.comparisonValueNumber)
    ].join("  ")

    return `${pieces} ${comparisonParts}`
  }

  priorNote() {
    if (this.leftUsesPrior()) return "Right-side comparison is unavailable while the subject side uses prior board state."
    if (this.rightUsesPrior()) return "Subject-side comparison is unavailable while the relation side uses prior board state."
    return ""
  }

  comparisonToggleText(side, sideState, hasComparison, open, locked) {
    if (locked) return "+ comparison unavailable"
    if (!hasComparison) return "+ comparison"
    if (open) {
      return `Hide comparison (${this.comparisonSummary(side, sideState)})`
    }

    return "+ comparison"
  }

  clearComparator(side) {
    this.state[side].comparisonMetric = ""
    this.state[side].comparison = "equal_to"
    this.state[side].comparisonValueSource = "exact_number"
  }

  setControlsDisabled(controls, disabled) {
    controls.forEach(control => {
      control.disabled = disabled
    })
  }

  comparisonLocked(side) {
    if (this.state.kind !== "relation") return false
    if (side === "left") return this.rightUsesPrior()
    return this.leftUsesPrior()
  }

  leftComparisonActive() {
    return this.state.kind === "relation" &&
      this.state.ui.leftComparisonOpen &&
      !this.comparisonLocked("left") &&
      Boolean(this.state.left.comparisonMetric)
  }

  rightComparisonActive() {
    return this.state.kind === "relation" &&
      this.state.ui.rightComparisonOpen &&
      !this.comparisonLocked("right") &&
      Boolean(this.state.right.comparisonMetric)
  }

  comparisonSummary(side, sideState) {
    if (side === "left" && this.state.kind !== "relation") {
      return `${this.operatorLabel(sideState.comparison)} ${this.valueLabel(sideState.comparisonValueSource, sideState.comparisonValueNumber)}`
    }

    return `${sideState.comparisonMetric} ${this.operatorLabel(sideState.comparison)} ${this.valueLabel(sideState.comparisonValueSource, sideState.comparisonValueNumber)}`
  }

  leftUsesPrior() {
    return this.state.kind === "relation" &&
      this.state.left.comparisonMetric &&
      this.state.left.comparisonValueSource === "prior_board_state"
  }

  rightUsesPrior() {
    return this.state.kind === "relation" &&
      this.state.right.comparisonMetric &&
      this.state.right.comparisonValueSource === "prior_board_state"
  }

  assignPath(path, value) {
    const parts = path.split(".")
    let current = this.state
    while (parts.length > 1) {
      current = current[parts.shift()]
    }
    current[parts[0]] = value
  }

  subjectLabel(value) {
    if (value === "allies") return "Allied"
    if (value === "opponents") return "Opponent"
    return SUBJECT_OPTIONS.find(([, v]) => v === value)?.[0] || value
  }

  specifierLabel(value) {
    return SPECIFIER_OPTIONS.find(([, v]) => v === value)?.[0] || value
  }

  specifierModeLabel(value) {
    return value === "exclude" ? "is not" : "is"
  }

  specifierPhrase(mode, specifier) {
    if (mode === "exclude") {
      return `non-${this.specifierLabel(specifier)}`
    }
    if (specifier === "any") {
      return ""
    }
    return this.specifierLabel(specifier)
  }

  operatorLabel(value) {
    return COMPARISON_OPTIONS.find(([, v]) => v === value)?.[0] || value
  }

  relationLabel(value) {
    switch (value) {
      case "attack":
        return "attacking"
      case "defend":
        return "defending"
      case "cover":
        return "covering"
      case "shield":
        return "shielding"
      case "adjacent":
        return "adjacent to"
      default:
        return value
    }
  }

  valueLabel(source, number) {
    if (source === "exact_number") return String(number)
    return COMPARISON_VALUE_OPTIONS.find(([, v]) => v === source)?.[0] || source
  }
}
