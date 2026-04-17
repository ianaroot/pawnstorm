import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sidebar", "overlay"]
  static classes = ["open", "closed"]

  isCompactViewport() {
    return window.innerWidth <= 1024
  }
  
  connect() {
    // Collapse the sidebar on tablet/mobile widths so the hamburger remains usable.
    if (this.isCompactViewport()) {
      this.close()
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close()
      }
    })
  }
  
  disconnect() {
    document.removeEventListener('keydown', this.handleEscape)
  }
  
  toggle() {
    if (this.isOpen()) {
      this.close()
    } else {
      this.open()
    }
  }
  
  open() {
    this.sidebarTarget.classList.add('sidebar--open')
    this.sidebarTarget.classList.remove('sidebar--closed')
    if (this.hasOverlayTarget) { this.overlayTarget.classList.add('sidebar-overlay--visible') }
    document.body.style.overflow = 'hidden'
  }
  
  close() {
    this.sidebarTarget.classList.remove('sidebar--open')
    this.sidebarTarget.classList.add('sidebar--closed')
    if (this.hasOverlayTarget) { this.overlayTarget.classList.remove('sidebar-overlay--visible') }
    document.body.style.overflow = ''
  }
  
  isOpen() {
    return this.sidebarTarget.classList.contains('sidebar--open')
  }
  
  navigate() {
    if (this.isCompactViewport()) {
      this.close()
    }
  }
}
