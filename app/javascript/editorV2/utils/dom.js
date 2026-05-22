export function isEditableTarget(target) {
  if (!target || !target.tagName) { return false }
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}
