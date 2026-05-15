// Narrows ctx.singulars based on crossFrame entries whose shape implies a
// capture is forced. Today that's only unary PBS on the enemy team with the
// direction going down (count or aggregate_value) — enemy pieces or aggregate
// value can only decrease across frames via capture, since the enemy doesn't
// move during the moving team's turn. Relational, position, mobility, and
// upward-direction entries don't force capture and are ignored here.
export function narrowForCrossFrame(ctx) {
  for (const entry of ctx.crossFrame ?? []) {
    if (!forcesCapture(entry, ctx)) { continue }
    narrowCapturedPiece(ctx.singulars.captured_piece, entry.currentProposition.species_set)
  }
}

function forcesCapture(entry, ctx) {
  if (entry.source !== 'unary') { return false }
  if (entry.direction !== '-') { return false }
  if (entry.metric !== 'count' && entry.metric !== 'aggregate_value') { return false }
  if (entry.currentProposition.team !== ctx.enemyTeam) { return false }
  return true
}

function narrowCapturedPiece(captured, crossFrameSpecies) {
  const next = new Set()
  for (const species of captured.species_set) {
    if (species === null) { continue }
    if (!crossFrameSpecies.has(species)) { continue }
    next.add(species)
  }
  captured.species_set = next
}
