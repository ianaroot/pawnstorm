import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["field"]

  select(event) {
    this.fieldTarget.value = event.params.value
    this.fieldTarget.form.requestSubmit()
  }
}
