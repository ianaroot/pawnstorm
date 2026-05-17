// Enemy count/value can only decrease across frames via capture (the enemy
// doesn't move on the moving team's turn), so a decreasing-enemy PBS entry
// forces the captured piece's species.
export function narrowForCrossFrame(ctx) {
  for (const entry of ctx.crossFrame ?? []) {
    if (!forcesCapture(entry, ctx)) { continue }
    const captured = ctx.singulars.captured_piece
    const forced = entry.currentProposition.species_set
    captured.species_set = new Set(
      [...captured.species_set].filter(s => s !== null && forced.has(s))
    )
  }
}

function forcesCapture(entry, ctx) {
  if (entry.source !== 'census') { return false }
  if (entry.direction !== '-') { return false }
  if (entry.metric !== 'count' && entry.metric !== 'aggregate_value') { return false }
  if (entry.currentProposition.team !== ctx.enemyTeam) { return false }
  return true
}
