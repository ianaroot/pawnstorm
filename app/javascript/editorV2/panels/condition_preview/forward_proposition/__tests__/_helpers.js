import Board from 'gameplay/board'

// Shared test ctx factory for forward_proposition tests. Use overrides to
// customize. Default values match what build_engine sets up at runtime.
export function defaultTestCtx(overrides = {}) {
  return {
    singulars: {},
    propositions: [],
    relations: [],
    crossFrame: [],
    edgeBiasState: { count: 0, max: 2 },
    pinState: { count: 0, max: 2 },
    checkState: { count: 0, max: 1 },
    movingTeam: Board.WHITE,
    enemyTeam: Board.BLACK,
    ...overrides
  }
}

export function bindMoved(ctx, sourcePlan, role) {
  ctx.movedBinding = { assignments: [{ sourcePlan, role }] }
  return ctx
}
