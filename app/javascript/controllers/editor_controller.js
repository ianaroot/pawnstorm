import { Controller } from "@hotwired/stimulus"
import { initEditor } from "editorV2"

export default class extends Controller {
  static values = { botId: Number }
  
  connect() {
    const container = document.getElementById('nodes-canvas')
    const svgContainer = document.getElementById('connections-canvas')
    const editorPanel = document.getElementById('node-form-panel')
    if (!container || !svgContainer) {
      console.error('Editor container elements not found')
      return
    }
    initEditor(this.botIdValue, container, svgContainer, editorPanel)
      .then(api => {
        console.log('editorV2 initialized successfully')
        if (document.body.dataset.environment !== 'production') { window.editorAPI = api }
      })
      .catch(err => {
        console.error('Failed to initialize editorV2:', err)
      })
  }
  
  disconnect() {
    // Clean up on navigation away from editor
    if (window.editorAPI?.destroy) {
      window.editorAPI.destroy()
    }
    window.editorAPI = null
  }
}