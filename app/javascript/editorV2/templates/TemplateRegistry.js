import { CURRENT_TEMPLATES } from 'editorV2/templates/definitions/currentTemplates'
import { validateTemplates } from 'editorV2/templates/validateTemplates'

const RAW_TEMPLATES = [
  ...CURRENT_TEMPLATES
]

export const TEMPLATES = Object.freeze(validateTemplates(RAW_TEMPLATES))

export function templatesForCategory(category) {
  return TEMPLATES.filter(template => template.category === category)
}

export function findTemplate(templateId) {
  return TEMPLATES.find(template => template.id === templateId) || null
}
