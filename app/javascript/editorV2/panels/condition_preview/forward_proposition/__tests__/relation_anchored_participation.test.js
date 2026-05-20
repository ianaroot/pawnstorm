import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { satisfyAttackOrDefend, activeAttackOrDefendSets } from '../relations/attack_or_defend'
import { satisfyAdjacent, activeAdjacentSets } from '../relations/adjacent'
import { defaultTestCtx } from './_helpers'

function sq(file, rank) { return rank * 8 + file }
const D4 = sq(3, 3)
const geom = () => 0.5 // drives geometry shuffles inside tryAnchored

function singular(team, species, position) {
  return {
    team,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([position]) }
  }
}

function side({ team, species }) {
  return {
    team,
    species_set: new Set(Array.isArray(species) ? species : [species]),
    region: { kind: 'all' },
    boundSingularActor: null,
    count_range: { min: 1, max: Infinity },
    aggregate_value_range: { min: 0, max: Infinity },
    aggregate_mobility_range: { min: 0, max: Infinity }
  }
}

function rel(operator, subj, tgt) {
  return {
    operator,
    subjectSide: side(subj),
    targetSide: side(tgt),
    sourcePlan: { tag: `${operator}-${subj.species}-${tgt.species}` }
  }
}

// Bind moved_piece to a role of `relation` via the chain-global binding the
// satisfier now consumes.
function bind(ctx, relation, role) {
  const sideObj = role === 'subject' ? relation.subjectSide : relation.targetSide
  ctx.movedBinding = { assignments: [{ sourcePlan: relation.sourcePlan, role, side: sideObj }] }
}

describe('attack/defend — moved_piece recruited via ctx.movedBinding', () => {
  it('moved_piece bound as SUBJECT: target placed on a square it controls', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = rel('attack',
      { team: Board.WHITE, species: Board.NIGHT },
      { team: Board.BLACK, species: Board.QUEEN })
    bind(ctx, relation, 'subject')
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    const result = satisfyAttackOrDefend(relation, pieces, ctx, geom)

    expect(result).not.toBeNull()
    expect(activeAttackOrDefendSets(relation, result).activeSubjects.has(D4)).toBe(true)
  })

  it('defend: moved_piece bound as SUBJECT defending an allied target', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = rel('defend',
      { team: Board.WHITE, species: Board.NIGHT },
      { team: Board.WHITE, species: Board.ROOK })
    bind(ctx, relation, 'subject')
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    const result = satisfyAttackOrDefend(relation, pieces, ctx, geom)

    expect(result).not.toBeNull()
    expect(activeAttackOrDefendSets(relation, result).activeSubjects.has(D4)).toBe(true)
  })

  it('no binding → bystander: existing tryPlace path still satisfies', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.NIGHT, D4) } })
    const relation = rel('attack',
      { team: Board.WHITE, species: Board.NIGHT },
      { team: Board.BLACK, species: Board.QUEEN })
    ctx.movedBinding = { assignments: [] }
    const pieces = new Map([[D4, Board.WHITE + Board.NIGHT]])

    expect(satisfyAttackOrDefend(relation, pieces, ctx, geom)).not.toBeNull()
  })
})

describe('adjacent — moved_piece recruited via ctx.movedBinding', () => {
  it('moved_piece bound as SUBJECT: target placed adjacent to it', () => {
    const ctx = defaultTestCtx({ singulars: { moved_piece: singular(Board.WHITE, Board.BISHOP, D4) } })
    const relation = rel('adjacent',
      { team: Board.WHITE, species: Board.BISHOP },
      { team: Board.BLACK, species: Board.QUEEN })
    bind(ctx, relation, 'subject')
    const pieces = new Map([[D4, Board.WHITE + Board.BISHOP]])

    const result = satisfyAdjacent(relation, pieces, ctx, geom)

    expect(result).not.toBeNull()
    expect(activeAdjacentSets(relation, result).activeSubjects.has(D4)).toBe(true)
  })
})
