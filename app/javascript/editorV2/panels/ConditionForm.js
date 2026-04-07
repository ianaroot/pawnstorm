  class ConditionForm {
    constructor(editorPanel) {
      this.editorPanel = editorPanel
      this.boundHandleFieldChange = this.handleFieldChange.bind(this)
    }

    attach() {
      this.editorPanel.querySelector('#cond-subject')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-subject-specifier-mode')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-subject-specifier')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation-specifier-mode')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation-specifier')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-comparison')?.addEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-comparison-value-source')?.addEventListener('change', this.boundHandleFieldChange)
    }

    detach() {
      this.editorPanel.querySelector('#cond-subject')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-subject-specifier-mode')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-subject-specifier')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation-specifier-mode')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-relation-specifier')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-comparison')?.removeEventListener('change', this.boundHandleFieldChange)
      this.editorPanel.querySelector('#cond-comparison-value-source')?.removeEventListener('change', this.boundHandleFieldChange)
    }

    populate(nodeData = {}) {
      this.writeConditionFormFields(this.conditionFormFields(), nodeData)
      this.updateConditionFieldVisibility()
    }
    
    buildPayload() {
      return this.buildConditionDataPayload()
    }

    // ===== Condition Editor =====

    updateConditionFieldVisibility() {
      if (!this.editorPanel) {
        return
      }

      const fields = this.conditionFormFields()
      this.filterConditionOptions(fields)
      this.updateConditionGroupVisibility(fields)
    }

    conditionFormFields() {
      return {
        subject: this.editorPanel.querySelector('#cond-subject'),
        subjectSpecifierMode: this.editorPanel.querySelector('#cond-subject-specifier-mode'),
        subjectSpecifier: this.editorPanel.querySelector('#cond-subject-specifier'),
        relation: this.editorPanel.querySelector('#cond-relation'),
        relationSpecifierMode: this.editorPanel.querySelector('#cond-relation-specifier-mode'),
        relationSpecifier: this.editorPanel.querySelector('#cond-relation-specifier'),
        comparison: this.editorPanel.querySelector('#cond-comparison'),
        comparisonValueNumber: this.editorPanel.querySelector('#cond-comparison-value-number'),
        comparisonValueSource: this.editorPanel.querySelector('#cond-comparison-value-source')
      }
    }

    writeConditionFormFields(fields, nodeData = {}) {
      if (fields.subject) fields.subject.value = nodeData.subject || 'moved_piece'
      if (fields.subjectSpecifierMode) fields.subjectSpecifierMode.value = nodeData.subjectSpecifierMode || 'include'
      if (fields.subjectSpecifier) fields.subjectSpecifier.value = nodeData.subjectSpecifier || 'any'
      if (fields.relation) fields.relation.value = nodeData.relation || 'attacker'
      if (fields.relationSpecifierMode) fields.relationSpecifierMode.value = nodeData.relationSpecifierMode || 'include'
      if (fields.relationSpecifier) fields.relationSpecifier.value = nodeData.relationSpecifier || 'any'
      if (fields.comparison) fields.comparison.value = nodeData.comparison || 'equal_to'

      if (typeof nodeData.comparisonValue === 'number') {
        if (fields.comparisonValueNumber) fields.comparisonValueNumber.value = nodeData.comparisonValue
        if (fields.comparisonValueSource) fields.comparisonValueSource.value = 'exact_number'
        return
      }

      if (fields.comparisonValueNumber) fields.comparisonValueNumber.value = 1
      if (fields.comparisonValueSource) fields.comparisonValueSource.value = nodeData.comparisonValue || 'exact_number'
    }

    currentConditionFormState(fields) {
      const availableRelationSpecifiers = fields.relationSpecifier
        ? this.enabledOptions(fields.relationSpecifier)
        : []

      return {
        subject: fields.subject?.value,
        subjectSpecifierMode: fields.subjectSpecifierMode?.value || 'include',
        subjectSpecifier: fields.subjectSpecifier?.value,
        relation: fields.relation?.value,
        relationSpecifierMode: fields.relationSpecifierMode?.value || 'include',
        relationSpecifier: fields.relationSpecifier?.value,
        comparison: fields.comparison?.value,
        comparisonValueSource: fields.comparisonValueSource?.value,
        showRelationSpecifier: availableRelationSpecifiers.some(option => option.value !== 'any')
      }
    }

    filterConditionOptions(fields) {
      const subject = fields.subject?.value

      if (!subject || !fields.relation || !fields.relationSpecifier || !fields.comparisonValueSource) {
        return
      }

      this.filterRelationOptions(fields.relation, subject)

      const relation = fields.relation.value
      this.filterRelationSpecifierOptions(fields.relationSpecifier, subject, relation)
      this.filterSubjectSpecifierOptions(fields.subjectSpecifier, fields.subjectSpecifierMode)
      this.filterRelationSpecifierByMode(fields.relationSpecifier, fields.relationSpecifierMode)
      this.filterComparisonValueSourceOptions(fields.comparisonValueSource, subject)
    }

    filterSubjectSpecifierOptions(subjectSpecifierSelect, subjectSpecifierModeSelect) {
      this.filterSpecifierOptionsByMode(subjectSpecifierSelect, subjectSpecifierModeSelect)
    }

    filterRelationOptions(relationSelect, subject) {
      this.filterSelectOptions(relationSelect, option => {
        const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
        return validSubjects.length === 0 || validSubjects.includes(subject)
      })
    }

    filterRelationSpecifierOptions(relationSpecifierSelect, subject, relation) {
      this.filterSelectOptions(relationSpecifierSelect, option => {
        const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
        const validRelations = option.dataset.validRelations?.split(',').filter(Boolean) || []
        const subjectMatches = validSubjects.length === 0 || validSubjects.includes(subject)
        const relationMatches = validRelations.length === 0 || validRelations.includes(relation)
        return subjectMatches && relationMatches
      })
    }

    filterRelationSpecifierByMode(relationSpecifierSelect, relationSpecifierModeSelect) {
      this.filterSpecifierOptionsByMode(relationSpecifierSelect, relationSpecifierModeSelect)
    }

    filterSpecifierOptionsByMode(specifierSelect, specifierModeSelect) {
      if (!specifierSelect || !specifierModeSelect) {
        return
      }

      const anyOption = Array.from(specifierSelect.options).find(option => option.value === 'any')
      if (!anyOption) {
        return
      }

      const excludeMode = specifierModeSelect.value === 'exclude'

      if (excludeMode) {
        anyOption.hidden = true
        anyOption.disabled = true

        if (specifierSelect.value === 'any') {
          const firstValidOption = Array.from(specifierSelect.options).find(option => !option.disabled)
          if (firstValidOption) {
            specifierSelect.value = firstValidOption.value
          }
        }

        return
      }

      const validSubjects = anyOption.dataset.validSubjects?.split(',').filter(Boolean) || []
      const validRelations = anyOption.dataset.validRelations?.split(',').filter(Boolean) || []
      const currentSubject = this.editorPanel?.querySelector('#cond-subject')?.value
      const currentRelation = this.editorPanel?.querySelector('#cond-relation')?.value
      const subjectMatches = validSubjects.length === 0 || validSubjects.includes(currentSubject)
      const relationMatches = validRelations.length === 0 || validRelations.includes(currentRelation)
      const shouldShowAny = subjectMatches && relationMatches

      anyOption.hidden = !shouldShowAny
      anyOption.disabled = !shouldShowAny
    }

    filterComparisonValueSourceOptions(comparisonValueSourceSelect, subject) {
      this.filterSelectOptions(comparisonValueSourceSelect, option => {
        if (option.value === 'exact_number') {
          return true
        }

        const validSubjects = option.dataset.validSubjects?.split(',').filter(Boolean) || []
        return validSubjects.length === 0 || validSubjects.includes(subject)
      })
    }

    updateConditionGroupVisibility(fields) {
      const state = this.currentConditionFormState(fields)
      const needsComparisonValue = Boolean(state.comparison)
      const showExactNumberInput = needsComparisonValue && state.comparisonValueSource === 'exact_number'

      this.toggleEditorGroup('#condition-specifier-group', !state.subject)
      this.toggleEditorGroup('#condition-relation-group', !state.subject || !state.subjectSpecifier)
      this.toggleEditorGroup('#condition-relation-specifier-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.showRelationSpecifier)
      this.toggleEditorGroup('#condition-comparison-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.relationSpecifier)
      this.toggleEditorGroup('#condition-comparison-value-group', !state.subject || !state.subjectSpecifier || !state.relation || !state.relationSpecifier || !state.comparison || !needsComparisonValue)
      fields.comparisonValueNumber?.classList.toggle('hidden', !showExactNumberInput)
    }

    toggleEditorGroup(selector, hidden) {
      this.editorPanel.querySelector(selector)?.classList.toggle('hidden', hidden)
    }

    enabledOptions(select) {
      return Array.from(select.options).filter(option => !option.disabled)
    }

    filterSelectOptions(select, predicate) {
      const options = Array.from(select.options)
      let selectedOptionIsValid = false

      options.forEach(option => {
        const isValid = predicate(option)
        option.hidden = !isValid
        option.disabled = !isValid

        if (isValid && option.value === select.value) {
          selectedOptionIsValid = true
        }
      })

      if (selectedOptionIsValid) {
        return
      }

      const firstValidOption = options.find(option => !option.disabled)
      if (firstValidOption) {
        select.value = firstValidOption.value
      }
    }

    handleFieldChange() {
      this.updateConditionFieldVisibility()
    }

    buildConditionDataPayload() {
      const fields = this.conditionFormFields()
      const comparison = fields.comparison?.value || 'equal_to'
      const comparisonValueSource = fields.comparisonValueSource?.value || 'exact_number'
      const comparisonValue = (
        comparisonValueSource === 'exact_number'
          ? Number(fields.comparisonValueNumber?.value || 1)
          : comparisonValueSource
      )

      return {
        subject: fields.subject?.value || 'moved_piece',
        subjectSpecifierMode: fields.subjectSpecifierMode?.value || 'include',
        subjectSpecifier: fields.subjectSpecifier?.value || 'any',
        relation: fields.relation?.value || 'attacker',
        relationSpecifierMode: fields.relationSpecifierMode?.value || 'include',
        relationSpecifier: fields.relationSpecifier?.value || 'any',
        comparison: comparison,
        comparisonValue: comparisonValue
      }
    }
    
  }

  export default ConditionForm