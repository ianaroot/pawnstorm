import { ACTIVITY_TEMPLATES } from 'editorV2/templates/definitions/activity'
import { CAPTURE_TEMPLATES } from 'editorV2/templates/definitions/captures'
import { DEFENSE_TEMPLATES } from 'editorV2/templates/definitions/defense'
import { ENDGAME_TEMPLATES } from 'editorV2/templates/definitions/endgame'
import { KING_PRESSURE_TEMPLATES } from 'editorV2/templates/definitions/kingPressure'
import { OPENING_TEMPLATES } from 'editorV2/templates/definitions/opening'
import { PAWN_PLAY_TEMPLATES } from 'editorV2/templates/definitions/pawnPlay'
import { TACTIC_TEMPLATES } from 'editorV2/templates/definitions/tactics'
import { validateTemplates } from 'editorV2/templates/validateTemplates'

const RAW_TEMPLATES = [
  ...OPENING_TEMPLATES,
  ...CAPTURE_TEMPLATES,
  ...DEFENSE_TEMPLATES,
  ...PAWN_PLAY_TEMPLATES,
  ...ACTIVITY_TEMPLATES,
  ...TACTIC_TEMPLATES,
  ...KING_PRESSURE_TEMPLATES,
  ...ENDGAME_TEMPLATES
]

export const TEMPLATES = Object.freeze(validateTemplates(RAW_TEMPLATES))

export function templatesForCategory(category) {
  return TEMPLATES.filter(template => template.category === category)
}

export function findTemplate(templateId) {
  return TEMPLATES.find(template => template.id === templateId) || null
}
