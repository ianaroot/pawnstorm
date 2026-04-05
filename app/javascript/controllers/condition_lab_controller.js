import { Controller } from "@hotwired/stimulus"

const SUBJECT_OPTIONS = [
  ["Allied", "allied"],
  ["Enemy", "enemy"],
  ["Moved Piece", "moved_piece"],
  ["Captured Piece", "captured_piece"],
  ["Enemy Moved Piece", "enemy_moved_piece"],
  ["Enemy Captured Piece", "enemy_captured_piece"]
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
  ["Value", "value"],
  ["Same-Piece", "same_piece"]
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
  ["Integer", "exact_number"],
  ["Moved Piece Value", "moved_piece_value"],
  ["Captured Piece Value", "captured_piece_value"],
  ["Prior Board State", "prior_board_state"]
]

const DEFAULT_STATE = Object.freeze({
  kind: "relational",
  left: {
    subject: "allied",
    specifier: "pawn",
    specifierMode: "include",
    comparisonMetric: "",
    comparison: "equal_to",
    comparisonValueSource: "exact_number",
    comparisonValueNumber: 2
  },
  relation: "attack",
  right: {
    subject: "enemy",
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
    "leftComparisonField",
    "leftComparisonToggle",
    "leftComparisonBody",
    "rightSubject",
    "rightSpecifier",
    "rightSpecifierMode",
    "rightMetric",
    "rightComparison",
    "rightComparisonValueSource",
    "rightComparisonValueNumber",
    "rightComparisonField",
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
    this.state.kind = value === "same_piece" || RELATION_OPTIONS.some(([, option]) => option === value) ? "relational" : "unary"
    if (this.state.kind === "relational") {
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

    if (side === "right" && this.state.kind !== "relational") return
    if (this.comparisonLocked(side)) return

    const sideState = this.state[side]
    const currentlyOpen = this.state.ui[key]

    if (!currentlyOpen && this.state.kind === "relational" && !sideState.comparisonMetric) {
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

    if (this.state.kind !== "relational" && path.startsWith("left.")) {
      path = path.replace(/^left\./, "unary.")
    }

    const value = event.target.type === "number"
      ? Number(event.target.value || 0)
      : event.target.type === "checkbox"
        ? (event.target.checked ? "exclude" : "include")
        : event.target.value
    this.assignPath(path, value)
    this.renderAll()
  }

  renderAll() {
    this.renderSelectOptions()
    this.applyCompatibilityRules()
    this.renderFieldValues()
    this.renderVisibility()
    try {
      this.renderComparisonState("left")
      this.renderComparisonState("right")
    } catch (error) {
      this.formulationPreviewTarget.textContent = `[renderComparisonState failed: ${error.message}]`
      this.nodePreviewTarget.innerHTML = `<div class="condition-preview__chunk">[renderComparisonState failed]</div>`
      return
    }
    this.renderFormulationPreview()
    this.renderPreview()
    this.renderPriorNote()
  }

  renderSelectOptions() {
    this.renderOptions(this.leftSubjectTarget, SUBJECT_OPTIONS)
    this.renderOptions(
      this.rightSubjectTarget,
      SUBJECT_OPTIONS.filter(([, value]) => value !== "enemy_captured_piece")
    )

    this.renderOptions(this.leftSpecifierTarget, SPECIFIER_OPTIONS)
    this.renderOptions(this.rightSpecifierTarget, SPECIFIER_OPTIONS)

    this.renderVerbOptions(this.verbSelectorTarget)

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

  renderVerbOptions(select) {
    if (select.dataset.optionsInitialized === "true") return

    const relationOptions = RELATION_OPTIONS
      .map(([label, value]) => `<option value="${value}">${label}</option>`)
      .join("")

    const unaryOptions = UNARY_VERB_OPTIONS
      .map(([label, value]) => `<option value="${value}">${label}</option>`)
      .join("")

    select.innerHTML = `${relationOptions}<option disabled>────────</option>${unaryOptions}`
    select.dataset.optionsInitialized = "true"
  }

  applyCompatibilityRules() {
    if (this.state.kind !== "relational") return

    if (["captured_piece", "enemy_captured_piece"].includes(this.state.right.subject)) {
      this.state.right.subject = "enemy"
    }

    if (this.usesSamePiece()) {
      const allowedLeft = ["enemy_moved_piece", "captured_piece"]
      if (!allowedLeft.includes(this.state.left.subject)) {
        this.state.left.subject = "enemy_moved_piece"
      }

      this.state.right.subject = this.state.left.subject === "enemy_moved_piece"
        ? "captured_piece"
        : "enemy_moved_piece"

      this.state.left.specifier = "any"
      this.state.left.specifierMode = "include"
      this.state.right.specifier = "any"
      this.state.right.specifierMode = "include"
      this.clearComparator("left")
      this.clearComparator("right")
      this.state.ui.leftComparisonOpen = false
      this.state.ui.rightComparisonOpen = false
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
    this.verbSelectorTarget.value = this.state.kind === "relational" ? this.state.relation : this.state.unary.verb

    this.leftSubjectTarget.value = this.state.kind === "relational" ? this.state.left.subject : this.state.unary.subject
    this.leftSpecifierTarget.value = this.state.kind === "relational" ? this.state.left.specifier : this.state.unary.specifier
    this.leftSpecifierModeTarget.checked = (this.state.kind === "relational" ? this.state.left.specifierMode : this.state.unary.specifierMode) === "exclude"
    this.leftMetricTarget.value = this.state.left.comparisonMetric || "count"
    this.leftComparisonTarget.value = this.state.kind === "relational" ? this.state.left.comparison : this.state.unary.comparison
    this.leftComparisonValueSourceTarget.value = this.state.kind === "relational"
      ? this.state.left.comparisonValueSource
      : this.state.unary.comparisonValueSource
    this.leftComparisonValueNumberTarget.value = this.state.kind === "relational"
      ? this.state.left.comparisonValueNumber
      : this.state.unary.comparisonValueNumber

    this.rightSubjectTarget.value = this.state.right.subject
    this.rightSpecifierTarget.value = this.state.right.specifier
    this.rightSpecifierModeTarget.checked = this.state.right.specifierMode === "exclude"
    this.rightMetricTarget.value = this.state.right.comparisonMetric || "count"
    this.rightComparisonTarget.value = this.state.right.comparison || "equal_to"
    this.rightComparisonValueSourceTarget.value = this.state.right.comparisonValueSource
    this.rightComparisonValueNumberTarget.value = this.state.right.comparisonValueNumber
    this.unaryComparisonTarget.value = this.state.unary.comparison
    this.unaryComparisonValueSourceTarget.value = this.state.unary.comparisonValueSource
    this.unaryComparisonValueNumberTarget.value = this.state.unary.comparisonValueNumber
  }

  renderVisibility() {
    const relationMode = this.state.kind === "relational"
    const samePieceMode = relationMode && this.usesSamePiece()
    const leftNumber = this.leftComparisonValueSourceTarget.value === "exact_number"
    const rightNumber = this.rightComparisonValueSourceTarget.value === "exact_number"
    const unaryNumber = this.unaryComparisonValueSourceTarget.value === "exact_number"

    this.rightCardLabelTarget.textContent = relationMode ? "Target" : "Comparison"
    this.rightRelationFieldsTarget.classList.toggle("hidden", !relationMode)
    this.leftComparisonSectionTarget.classList.toggle("hidden", !relationMode || samePieceMode)
    this.rightComparisonToggleTarget.closest(".condition-lab-comparison").classList.toggle("hidden", samePieceMode)
    this.unaryComparisonSectionTarget.classList.toggle("hidden", relationMode)
    this.leftSpecifierTarget.closest(".condition-lab-field").classList.toggle("hidden", samePieceMode)
    this.rightSpecifierTarget.closest(".condition-lab-field").classList.toggle("hidden", samePieceMode)

    this.leftComparisonValueNumberTarget.classList.toggle(
      "hidden",
      !leftNumber
    )
    this.leftMetricTarget.classList.toggle("hidden", this.state.kind !== "relational")

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
    if (this.usesSamePiece()) return

    const sideState = side === "left"
      ? (this.state.kind === "relational" ? this.state.left : this.state.unary)
      : this.state.right

    const openKey = side === "left" ? "leftComparisonOpen" : "rightComparisonOpen"
    const bodyTarget = side === "left" ? this.leftComparisonBodyTarget : this.rightComparisonBodyTarget
    const toggleTarget = side === "left" ? this.leftComparisonToggleTarget : this.rightComparisonToggleTarget
    const compareUnavailable = this.comparisonLocked(side)
    const hasComparison = side === "left" && this.state.kind !== "relational"
      ? true
      : Boolean(sideState.comparisonMetric)
    const open = side === "right" && this.state.kind !== "relational" ? false : this.state.ui[openKey]

    if (side === "left" && this.state.kind !== "relational") {
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

    bodyTarget.classList.toggle("hidden", !open)
    toggleTarget.classList.remove("hidden")
    toggleTarget.disabled = compareUnavailable
    toggleTarget.textContent = this.comparisonToggleText(side, sideState, hasComparison, open, compareUnavailable)

    const comparisonField = side === "left" ? this.leftComparisonFieldTarget : this.rightComparisonFieldTarget
    const comparisonModeActive = !compareUnavailable
    comparisonField.classList.toggle("hidden", false)

    if (side === "left") {
      this.setControlsDisabled(
        [
          this.leftMetricTarget,
          this.leftComparisonTarget,
          this.leftComparisonValueSourceTarget,
          this.leftComparisonValueNumberTarget
        ],
        !open || !comparisonModeActive
      )
      this.leftComparisonValueNumberTarget.disabled = !open || !comparisonModeActive || this.leftComparisonValueSourceTarget.value !== "exact_number"
      return
    }

    this.setControlsDisabled(
      [
        this.rightMetricTarget,
        this.rightComparisonTarget,
        this.rightComparisonValueSourceTarget,
        this.rightComparisonValueNumberTarget
      ],
      !open || !comparisonModeActive
    )
    this.rightComparisonValueNumberTarget.disabled = !open || !comparisonModeActive || this.rightComparisonValueSourceTarget.value !== "exact_number"
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
    const summary = this.state.kind === "relational"
      ? this.relationSummary()
      : this.unarySummary()

    this.formulationPreviewTarget.textContent = summary || "[no condition text]"
  }

  renderPriorNote() {
    this.priorNoteTarget.textContent = ""
    this.priorNoteTarget.classList.add("hidden")
  }

  previewChunks() {
    if (this.state.kind === "relational") {
      if (this.usesSamePiece()) {
        return [
          this.sideSummary(this.state.left),
          "",
          this.relationLabel(this.state.relation),
          "",
          this.sideSummary(this.state.right)
        ]
      }

      const chunks = [
        this.sideSummary(this.state.left, { comparisonActive: this.leftComparisonActive() }),
        "",
        this.relationLabel(this.state.relation),
        "",
        this.sideSummary(this.state.right, { comparisonActive: this.rightComparisonActive() })
      ]

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
    return `${this.sideSummary(this.state.left, { comparisonActive: this.leftComparisonActive() })}${spacer}${this.relationLabel(this.state.relation)}${spacer}${this.sideSummary(this.state.right, { comparisonActive: this.rightComparisonActive() })}`
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

    if (!comparisonActive) return pieces
    if (!side.comparisonMetric) return pieces

    const comparisonParts = [
      side.comparisonMetric,
      this.operatorLabel(side.comparison),
      this.valueLabel(side.comparisonValueSource, side.comparisonValueNumber)
    ].join("  ")

    return `${pieces} ${comparisonParts}`
  }

  priorNote() {
    return ""
  }

  comparisonToggleText(side, sideState, hasComparison, open, locked) {
    if (locked) return this.comparisonUnavailableText(side)
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
    if (this.state.kind !== "relational") return false
    if (side === "left") return this.rightUsesPrior()
    return this.leftUsesPrior()
  }

  comparisonUnavailableText(side) {
    if (side === "left") {
      if (this.rightUsesPrior()) return "+ comparison unavailable while target uses prior"
    } else {
      if (this.leftUsesPrior()) return "+ comparison unavailable while subject uses prior"
    }

    return "+ comparison unavailable"
  }

  leftComparisonActive() {
    return this.state.kind === "relational" &&
      this.state.ui.leftComparisonOpen &&
      !this.comparisonLocked("left") &&
      Boolean(this.state.left.comparisonMetric)
  }

  rightComparisonActive() {
    return this.state.kind === "relational" &&
      this.state.ui.rightComparisonOpen &&
      !this.comparisonLocked("right") &&
      Boolean(this.state.right.comparisonMetric)
  }

  comparisonSummary(side, sideState) {
    if (side === "left" && this.state.kind !== "relational") {
      return `${this.operatorLabel(sideState.comparison)} ${this.valueLabel(sideState.comparisonValueSource, sideState.comparisonValueNumber)}`
    }

    return `${sideState.comparisonMetric} ${this.operatorLabel(sideState.comparison)} ${this.valueLabel(sideState.comparisonValueSource, sideState.comparisonValueNumber)}`
  }

  leftUsesPrior() {
    return this.state.kind === "relational" &&
      this.state.ui.leftComparisonOpen &&
      this.state.left.comparisonMetric &&
      this.state.left.comparisonValueSource === "prior_board_state"
  }

  rightUsesPrior() {
    return this.state.kind === "relational" &&
      this.state.ui.rightComparisonOpen &&
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
    if (value === "allied") return "Allied"
    if (value === "enemy") return "Enemy"
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
      case "same_piece":
        return "same-piece as"
      default:
        return value
    }
  }

  usesSamePiece() {
    return this.state.kind === "relational" && this.state.relation === "same_piece"
  }

  valueLabel(source, number) {
    if (source === "exact_number") return String(number)
    return COMPARISON_VALUE_OPTIONS.find(([, v]) => v === source)?.[0] || source
  }
}
