import { placeKingInCheckmate } from 'editorV2/panels/condition_preview/shared/king_placement'

// Checkmate strategy: places the constrained team's king in mate via a
// knight-smother pattern. Shares ctx.checkState with checkRestriction /
// stalemate.
export const checkmateStrategy = {
  name: 'checkmate',
  constraintKind: 'mobility',

  appliesTo(constraint, ctx, pieces, pool) {
    if (ctx.checkState.count >= ctx.checkState.max) { return false }
    if (constraint.region.kind === 'related-to') { return false }
    if (constraint.team === teamThatJustMoved(constraint.frame, ctx)) { return false }
    return true
  },

  apply(constraint, ctx, pieces, pool, random) {
    if (ctx.checkState.count >= ctx.checkState.max) { return null }
    const next = placeKingInCheckmate({
      pieces, team: constraint.team, frame: constraint.frame, ctx, random
    })
    if (next === null) { return null }
    ctx.checkState.count += 1
    return next
  }
}

function teamThatJustMoved(frame, ctx) {
  return frame === 'current' ? ctx.movingTeam : ctx.enemyTeam
}
