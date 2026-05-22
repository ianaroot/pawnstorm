import { kingsideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/kingside_castle'
import { queensideCastleScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/queenside_castle'
import { promotionPushScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/promotion_push'
import { promotionCaptureLeftScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/promotion_capture_left'
import { promotionCaptureRightScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/promotion_capture_right'
import { enPassantLeftScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/en_passant_left'
import { enPassantRightScenario } from 'editorV2/panels/condition_preview/forward_proposition/scenarios/en_passant_right'

export const SCENARIO_REGISTRY = Object.freeze([
  kingsideCastleScenario,
  queensideCastleScenario,
  promotionPushScenario,
  promotionCaptureLeftScenario,
  promotionCaptureRightScenario,
  enPassantLeftScenario,
  enPassantRightScenario
])
