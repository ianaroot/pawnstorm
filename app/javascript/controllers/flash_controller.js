import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["toast"]

  connect() {
    this.timers = this.toastTargets.map((toast) => {
      const delay = parseInt(toast.dataset.dismissAfter, 10)
      return Number.isNaN(delay) ? null : setTimeout(() => this.hide(toast), delay)
    })
  }

  disconnect() {
    this.timers?.forEach((timer) => timer && clearTimeout(timer))
  }

  dismiss(event) {
    this.hide(event.currentTarget.closest(".flash-toast"))
  }

  hide(toast) {
    if (!toast || toast.dataset.leaving) return

    toast.dataset.leaving = "true"
    toast.classList.add("flash-toast--leaving")
    setTimeout(() => toast.remove(), 300)
  }
}
