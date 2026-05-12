import { kingsideCastleScenario } from './kingside_castle'
import { queensideCastleScenario } from './queenside_castle'
import { promotionPushScenario } from './promotion_push'
import { promotionCaptureLeftScenario } from './promotion_capture_left'
import { promotionCaptureRightScenario } from './promotion_capture_right'

export const SCENARIO_REGISTRY = Object.freeze([
  kingsideCastleScenario,
  queensideCastleScenario,
  promotionPushScenario,
  promotionCaptureLeftScenario,
  promotionCaptureRightScenario
])
