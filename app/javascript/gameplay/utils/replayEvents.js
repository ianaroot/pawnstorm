// Dispatch a namespaced CustomEvent on `document` for match-replay lifecycle
// signals. Consumers (the tour engine, telemetry, etc.) listen for
// `replay:<name>` and read `event.detail`.
export function emitReplayEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(`replay:${name}`, { detail }))
}
