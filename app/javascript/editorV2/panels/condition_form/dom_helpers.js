// Shared, mode-agnostic DOM helpers used by every condition-form mode
// strategy. Pure DOM mutation — no form state.

const PILL_INPUT_CACHE = new WeakMap()

export function pillInputs(container) {
  if (!container) { return [] }
  let inputs = PILL_INPUT_CACHE.get(container)
  if (!inputs) {
    inputs = Array.from(container.querySelectorAll('input[type="radio"]'))
    PILL_INPUT_CACHE.set(container, inputs)
  }
  return inputs
}

export function pillValue(inputs) {
  return inputs?.find(input => input.checked)?.value
}

export function setPillChecked(inputs, value, numeric = false) {
  inputs?.forEach(input => {
    input.checked = (numeric ? Number(input.value) : input.value) === value
  })
}

export function disableOptions(select, disallowedValues) {
  Array.from(select.options).forEach(option => {
    option.disabled = disallowedValues.includes(option.value)
  })
}

export function enableAllOptions(select) {
  Array.from(select.options).forEach(option => {
    option.disabled = false
  })
}

export function showAllOptions(select) {
  Array.from(select.options).forEach(option => {
    option.hidden = false
    option.disabled = false
  })
}
