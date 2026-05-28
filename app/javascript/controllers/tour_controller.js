import { Controller } from "@hotwired/stimulus"
import TourEngine from "tour/engine"
import STEP_SETS from "tour/stepRegistry"

// Thin Stimulus wrapper around TourEngine. All engine behavior lives in
// app/javascript/tour/engine.js; this controller resolves a step set by name
// and manages the engine lifecycle.
//
// Usage:
//   <div data-controller="tour"
//        data-tour-set-value="editor-first-bot"
//        data-tour-auto-value="true"></div>
export default class extends Controller {
  static values = { set: String, auto: Boolean }

  connect() {
    if (this.autoValue) { this.start() }
  }

  disconnect() {
    if (this.engine) { this.engine.close() }
  }

  start() {
    if (this.engine) { return }
    const set = STEP_SETS[this.setValue]
    if (!set) {
      console.warn(`tour_controller: unknown step set "${this.setValue}"`)
      return
    }
    const steps = Array.isArray(set) ? set : set.steps
    this.engine = new TourEngine({
      steps,
      onStart: set.onStart,
      onClose: () => {
        set.onClose?.()
        this.engine = null
      }
    })
    this.engine.start()
  }

  close() {
    if (this.engine) { this.engine.close() }
  }
}
