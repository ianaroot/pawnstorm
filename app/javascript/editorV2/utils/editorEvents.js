// Dispatch a namespaced CustomEvent on `document` for editor lifecycle
// signals. Consumers (the tour engine, telemetry, etc.) listen for
// `editor:<name>` and read `event.detail`.
export function emitEditorEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(`editor:${name}`, { detail }))
}
