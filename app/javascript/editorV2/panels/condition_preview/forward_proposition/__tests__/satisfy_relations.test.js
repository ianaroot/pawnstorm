import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { controllingPositions, shieldingPositions } from 'gameplay/board_query_utils'
import { pieceCode, buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview/shared/board_utils'
import { satisfyRelations } from 'editorV2/panels/condition_preview/forward_proposition/relations/satisfy_relations'

const PERMISSIVE = Object.freeze({ min: 0, max: Infinity })

function side({ team, species_set, region = { kind: 'all' }, count_range = { min: 1, max: Infinity } }) {
  return {
    team,
    species_set,
    region,
    count_range,
    aggregate_value_range: { ...PERMISSIVE },
    aggregate_mobility_range: { ...PERMISSIVE }
  }
}

function relation(operator, { subjectTeam, subjectSpecies, targetTeam, targetSpecies }) {
  return {
    operator,
    subjectSide: side({ team: subjectTeam, species_set: new Set(subjectSpecies) }),
    targetSide: side({ team: targetTeam, species_set: new Set(targetSpecies) })
  }
}

function findOne(pieces, code) {
  for (const [pos, piece] of pieces) { if (piece === code) { return pos } }
  return null
}

function boardFrom(pieces) {
  return buildBoardFromLayout(buildLayoutFromPieces(pieces))
}

describe('satisfyRelations — attack', () => {
  it('places subject and target with subject controlling target on an empty board', () => {
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [relation('attack', {
        subjectTeam: Board.WHITE, subjectSpecies: [Board.QUEEN],
        targetTeam:  Board.BLACK, targetSpecies:  [Board.KING]
      })]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    const queenPos = findOne(result, pieceCode(Board.WHITE, Board.QUEEN))
    const kingPos  = findOne(result, pieceCode(Board.BLACK, Board.KING))
    expect(queenPos).not.toBeNull()
    expect(kingPos).not.toBeNull()
    expect(controllingPositions({ board: boardFrom(result), targetPosition: kingPos, team: Board.WHITE }))
      .toContain(queenPos)
  })

  it('satisfies the relation when an existing on-board piece is a candidate for the subject role', () => {
    const D4 = 27
    const seeded = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [relation('attack', {
        subjectTeam: Board.WHITE, subjectSpecies: [Board.QUEEN],
        targetTeam:  Board.BLACK, targetSpecies:  [Board.KING]
      })]
    }

    const result = satisfyRelations(ctx, seeded, () => 0.5)

    expect(result).not.toBeNull()
    const kingPos = findOne(result, pieceCode(Board.BLACK, Board.KING))
    expect(kingPos).not.toBeNull()
    // The seeded queen may be reused or a fresh queen may be placed — either
    // is a valid satisfaction. Only require that the relation holds.
    const attackers = controllingPositions({ board: boardFrom(result), targetPosition: kingPos, team: Board.WHITE })
    expect(attackers.length).toBeGreaterThanOrEqual(1)
  })

  it('leaves pieces unchanged when the relation is already satisfied and count caps are met', () => {
    const D4 = 27, H8 = 63
    const seeded = new Map([
      [D4, pieceCode(Board.WHITE, Board.QUEEN)],
      [H8, pieceCode(Board.BLACK, Board.KING)]
    ])
    // count_range max=1 on both sides means the satisfier MUST NOT place
    // additional matching pieces beyond the seeded pair.
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [{
        operator: 'attack',
        subjectSide: side({ team: Board.WHITE, species_set: new Set([Board.QUEEN]), count_range: { min: 1, max: 1 } }),
        targetSide:  side({ team: Board.BLACK, species_set: new Set([Board.KING]),  count_range: { min: 1, max: 1 } })
      }]
    }

    const result = satisfyRelations(ctx, seeded, () => 0.5)

    expect(result).not.toBeNull()
    expect(result.size).toBe(2)
    expect(result.get(D4)).toBe(pieceCode(Board.WHITE, Board.QUEEN))
    expect(result.get(H8)).toBe(pieceCode(Board.BLACK, Board.KING))
  })
})

describe('satisfyRelations — adjacent', () => {
  it('places subject and target on adjacent squares on an empty board', () => {
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [relation('adjacent', {
        subjectTeam: Board.WHITE, subjectSpecies: [Board.BISHOP],
        targetTeam:  Board.BLACK, targetSpecies:  [Board.PAWN]
      })]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    const bishopPos = findOne(result, pieceCode(Board.WHITE, Board.BISHOP))
    const pawnPos   = findOne(result, pieceCode(Board.BLACK, Board.PAWN))
    expect(bishopPos).not.toBeNull()
    expect(pawnPos).not.toBeNull()
    const fileDiff = Math.abs(Board.fileIndex(bishopPos) - Board.fileIndex(pawnPos))
    const rankDiff = Math.abs(Board.rankIndex(bishopPos) - Board.rankIndex(pawnPos))
    expect(Math.max(fileDiff, rankDiff)).toBe(1)
  })
})

describe('satisfyRelations — shield', () => {
  it('places shielder, shielded, and an opposing-team slider attacker so the shield geometry holds', () => {
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [relation('shield', {
        subjectTeam: Board.BLACK, subjectSpecies: [Board.PAWN],   // shielder
        targetTeam:  Board.BLACK, targetSpecies:  [Board.ROOK]    // shielded
      })]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)

    expect(result).not.toBeNull()
    const shielderPos = findOne(result, pieceCode(Board.BLACK, Board.PAWN))
    const shieldedPos = findOne(result, pieceCode(Board.BLACK, Board.ROOK))
    expect(shielderPos).not.toBeNull()
    expect(shieldedPos).not.toBeNull()

    const board = boardFrom(result)
    const shielders = shieldingPositions({ board, targetPosition: shieldedPos, team: Board.BLACK })
    expect(shielders).toContain(shielderPos)
  })
})
