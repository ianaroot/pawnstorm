import { beforeEach, describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { controllingPositions, materialValue, shieldingPositions } from 'gameplay/board_query_utils'
import { pieceCode, buildBoardFromLayout, buildLayoutFromPieces } from 'editorV2/panels/condition_preview/shared/board_utils'
import { satisfyRelations } from 'editorV2/panels/condition_preview/forward_proposition/relations/satisfy_relations'
import { bindMoved } from './_helpers'

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
    targetSide: side({ team: targetTeam, species_set: new Set(targetSpecies) }),
    sourcePlan: {}
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

describe('satisfyRelations — attack respecting caps', () => {
  it('returns null when adding the only target candidate species would violate a count_range.max cap', () => {
    const ctx = {
      singulars: {},
      propositions: [{
        team: Board.BLACK,
        frame: 'current',
        species_set: new Set([Board.KING]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }],
      relations: [relation('attack', {
        subjectTeam: Board.WHITE, subjectSpecies: [Board.QUEEN],
        targetTeam:  Board.BLACK, targetSpecies:  [Board.KING]
      })]
    }

    expect(satisfyRelations(ctx, new Map(), () => 0.5)).toBeNull()
  })
})

function activeAttackers({ pieces, subjectSide, targetSide }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const active = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (Board.parseTeam(tPiece) !== targetSide.team) { continue }
    if (!targetSide.species_set.has(Board.parseSpecies(tPiece))) { continue }
    const controllers = controllingPositions({ board, targetPosition: tPos, team: subjectSide.team })
    for (const sPos of controllers) {
      const sPiece = pieces.get(sPos)
      if (sPiece && Board.parseTeam(sPiece) === subjectSide.team && subjectSide.species_set.has(Board.parseSpecies(sPiece))) {
        active.add(sPos)
      }
    }
  }
  return active
}

describe('satisfyRelations — attack count_range.min >= 2', () => {
  it('places at least 2 distinct attackers controlling target(s)', () => {
    const subjectSide = side({ team: Board.WHITE, species_set: new Set([Board.QUEEN]), count_range: { min: 2, max: Infinity } })
    const targetSide  = side({ team: Board.BLACK, species_set: new Set([Board.KING]) })
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [{ operator: 'attack', subjectSide, targetSide }]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)
    expect(result).not.toBeNull()
    const active = activeAttackers({ pieces: result, subjectSide, targetSide })
    expect(active.size).toBeGreaterThanOrEqual(2)
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

describe('satisfyRelations — shield respecting caps', () => {
  it('returns null when adding the slider attacker would violate a count_range.max cap', () => {
    const ctx = {
      singulars: {},
      propositions: [{
        team: Board.WHITE,
        frame: 'current',
        species_set: new Set([Board.QUEEN, Board.ROOK, Board.BISHOP]),
        region: { kind: 'all' },
        count_range: { min: 0, max: 0 },
        aggregate_value_range: { min: 0, max: Infinity },
        aggregate_mobility_range: { min: 0, max: Infinity }
      }],
      relations: [relation('shield', {
        subjectTeam: Board.BLACK, subjectSpecies: [Board.PAWN],
        targetTeam:  Board.BLACK, targetSpecies:  [Board.ROOK]
      })]
    }

    expect(satisfyRelations(ctx, new Map(), () => 0.5)).toBeNull()
  })
})

function activeAdjacentSubjects({ pieces, subjectSide, targetSide }) {
  const active = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (Board.parseTeam(tPiece) !== targetSide.team) { continue }
    if (!targetSide.species_set.has(Board.parseSpecies(tPiece))) { continue }
    const fileT = Board.fileIndex(tPos), rankT = Board.rankIndex(tPos)
    for (const [sPos, sPiece] of pieces) {
      if (sPos === tPos) { continue }
      const fileS = Board.fileIndex(sPos), rankS = Board.rankIndex(sPos)
      if (Math.max(Math.abs(fileT - fileS), Math.abs(rankT - rankS)) !== 1) { continue }
      if (Board.parseTeam(sPiece) === subjectSide.team && subjectSide.species_set.has(Board.parseSpecies(sPiece))) {
        active.add(sPos)
      }
    }
  }
  return active
}

describe('satisfyRelations — adjacent count_range.min >= 2', () => {
  it('places at least 2 distinct subjects adjacent to target(s)', () => {
    const subjectSide = side({ team: Board.WHITE, species_set: new Set([Board.PAWN]), count_range: { min: 2, max: Infinity } })
    const targetSide  = side({ team: Board.BLACK, species_set: new Set([Board.KING]) })
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [{ operator: 'adjacent', subjectSide, targetSide }]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)
    expect(result).not.toBeNull()
    const active = activeAdjacentSubjects({ pieces: result, subjectSide, targetSide })
    expect(active.size).toBeGreaterThanOrEqual(2)
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

function controlledRandom(firstReturn, restSeed = 1) {
  let calls = 0
  let current = restSeed >>> 0
  return () => {
    if (calls === 0) {
      calls += 1
      return firstReturn
    }
    current = (current * 1664525 + 1013904223) >>> 0
    return current / 0x100000000
  }
}

const D4 = 27

describe('satisfyRelations — shield variant: moved-as-target', () => {
  let result
  beforeEach(() => {
    const movedPiece = {
      team: Board.WHITE, species_set: new Set([Board.QUEEN]),
      region: { kind: 'set', squares: new Set([D4]) }
    }
    const initialPieces = new Map([[D4, pieceCode(Board.WHITE, Board.QUEEN)]])
    const shieldRel = relation('shield', {
      subjectTeam: Board.WHITE, subjectSpecies: [Board.PAWN],
      targetTeam:  Board.WHITE, targetSpecies:  [Board.QUEEN]
    })
    const ctx = {
      singulars: { moved_piece: movedPiece },
      propositions: [],
      relations: [shieldRel]
    }
    bindMoved(ctx, shieldRel.sourcePlan, 'target')
    result = satisfyRelations(ctx, initialPieces, controlledRandom(0.99))
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('keeps moved_piece (white queen) at D4 as the target', () => {
    expect(result.get(D4)).toBe(pieceCode(Board.WHITE, Board.QUEEN))
  })

  it('shields D4 with at least one white shielder', () => {
    const shielders = shieldingPositions({ board: boardFrom(result), targetPosition: D4, team: Board.WHITE })
    expect(shielders.length).toBeGreaterThan(0)
  })
})

describe('satisfyRelations — shield variant: moved-as-shielder', () => {
  let result
  beforeEach(() => {
    const movedPiece = {
      team: Board.WHITE, species_set: new Set([Board.PAWN]),
      region: { kind: 'set', squares: new Set([D4]) }
    }
    const initialPieces = new Map([[D4, pieceCode(Board.WHITE, Board.PAWN)]])
    const shieldRel = relation('shield', {
      subjectTeam: Board.WHITE, subjectSpecies: [Board.PAWN],
      targetTeam:  Board.WHITE, targetSpecies:  [Board.QUEEN]
    })
    const ctx = {
      singulars: { moved_piece: movedPiece },
      propositions: [],
      relations: [shieldRel]
    }
    bindMoved(ctx, shieldRel.sourcePlan, 'subject')
    result = satisfyRelations(ctx, initialPieces, controlledRandom(0.99))
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('keeps moved_piece (white pawn) at D4 as the shielder', () => {
    expect(result.get(D4)).toBe(pieceCode(Board.WHITE, Board.PAWN))
  })

  it('makes D4 a shielder of the white queen target', () => {
    const queenPos = findOne(result, pieceCode(Board.WHITE, Board.QUEEN))
    const shielders = shieldingPositions({ board: boardFrom(result), targetPosition: queenPos, team: Board.WHITE })
    expect(shielders).toContain(D4)
  })
})

function activeShielders({ pieces, subjectSide, targetSide }) {
  const board = buildBoardFromLayout(buildLayoutFromPieces(pieces))
  const active = new Set()
  for (const [tPos, tPiece] of pieces) {
    if (Board.parseTeam(tPiece) !== targetSide.team) { continue }
    if (!targetSide.species_set.has(Board.parseSpecies(tPiece))) { continue }
    const shielders = shieldingPositions({ board, targetPosition: tPos, team: targetSide.team })
    for (const sPos of shielders) {
      const sPiece = pieces.get(sPos)
      if (sPiece && Board.parseTeam(sPiece) === subjectSide.team && subjectSide.species_set.has(Board.parseSpecies(sPiece))) {
        active.add(sPos)
      }
    }
  }
  return active
}

describe('satisfyRelations — shield aggregate_value_range.min driven', () => {
  it('keeps placing shielders until subject-side aggregate value reaches min', () => {
    const subjectSide = {
      team: Board.WHITE, species_set: new Set([Board.NIGHT]),
      region: { kind: 'all' },
      count_range: { min: 1, max: Infinity },
      aggregate_value_range: { min: 6, max: Infinity },
      aggregate_mobility_range: { min: 0, max: Infinity }
    }
    const targetSide = side({ team: Board.WHITE, species_set: new Set([Board.QUEEN]) })
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [{ operator: 'shield', subjectSide, targetSide }]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)
    expect(result).not.toBeNull()
    const active = activeShielders({ pieces: result, subjectSide, targetSide })
    let sum = 0
    for (const pos of active) { sum += materialValue(result.get(pos).slice(1)) }
    expect(sum).toBeGreaterThanOrEqual(6)
  })
})

describe('satisfyRelations — shield count_range.min >= 2', () => {
  it('places at least 2 distinct active shielders', () => {
    const subjectSide = side({ team: Board.WHITE, species_set: new Set([Board.PAWN]), count_range: { min: 2, max: Infinity } })
    const targetSide  = side({ team: Board.WHITE, species_set: new Set([Board.QUEEN]) })
    const ctx = {
      singulars: {},
      propositions: [],
      relations: [{ operator: 'shield', subjectSide, targetSide }]
    }

    const result = satisfyRelations(ctx, new Map(), () => 0.5)
    expect(result).not.toBeNull()
    const active = activeShielders({ pieces: result, subjectSide, targetSide })
    expect(active.size).toBeGreaterThanOrEqual(2)
  })
})

describe('satisfyRelations — shield variant: subject side bound to a singular shielder', () => {
  let result
  beforeEach(() => {
    const enemyMoved = {
      team: Board.BLACK, species_set: new Set([Board.BISHOP]),
      region: { kind: 'set', squares: new Set([D4]) }
    }
    const initialPieces = new Map([[D4, pieceCode(Board.BLACK, Board.BISHOP)]])
    const subjectSide = {
      team: Board.BLACK, species_set: new Set([Board.BISHOP]),
      region: { kind: 'all' },
      count_range: { min: 1, max: Infinity },
      aggregate_value_range: { ...PERMISSIVE },
      aggregate_mobility_range: { ...PERMISSIVE },
      boundSingularActor: 'enemy_moved_piece'
    }
    const targetSide = side({ team: Board.BLACK, species_set: new Set([Board.KING]) })
    const ctx = {
      singulars: { enemy_moved_piece: enemyMoved },
      propositions: [],
      relations: [{ operator: 'shield', subjectSide, targetSide }]
    }
    result = satisfyRelations(ctx, initialPieces, controlledRandom(0.99))
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('keeps the bound singular (black bishop) at D4', () => {
    expect(result.get(D4)).toBe(pieceCode(Board.BLACK, Board.BISHOP))
  })

  it('makes D4 a shielder of a black king on the same ray', () => {
    const kingPos = findOne(result, pieceCode(Board.BLACK, Board.KING))
    const shielders = shieldingPositions({ board: boardFrom(result), targetPosition: kingPos, team: Board.BLACK })
    expect(shielders).toContain(D4)
  })
})

describe('satisfyRelations — bound shield ignores coincidental external shield', () => {
  // d6 (BN) shielding d5 (BK) from d8 (WQ) on the d-file is a "coincidental"
  // shield not involving the bound singular at f7. The satisfier must still
  // place pieces so f7 (enemy_moved_piece) is itself a shielder.
  const D6 = 43
  const D5 = 35
  const D8 = 59
  const F7 = 53
  let result
  beforeEach(() => {
    const enemyMoved = {
      team: Board.BLACK, species_set: new Set([Board.BISHOP]),
      region: { kind: 'set', squares: new Set([F7]) }
    }
    const initialPieces = new Map([
      [F7, pieceCode(Board.BLACK, Board.BISHOP)],
      [D6, pieceCode(Board.BLACK, Board.NIGHT)],
      [D5, pieceCode(Board.BLACK, Board.KING)],
      [D8, pieceCode(Board.WHITE, Board.QUEEN)]
    ])
    const subjectSide = {
      team: Board.BLACK,
      species_set: new Set([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN]),
      region: { kind: 'all' },
      count_range: { min: 1, max: Infinity },
      aggregate_value_range: { ...PERMISSIVE },
      aggregate_mobility_range: { ...PERMISSIVE },
      boundSingularActor: 'enemy_moved_piece'
    }
    const targetSide = side({ team: Board.BLACK, species_set: new Set([Board.KING]) })
    const ctx = {
      singulars: { enemy_moved_piece: enemyMoved },
      propositions: [],
      relations: [{ operator: 'shield', subjectSide, targetSide }]
    }
    result = satisfyRelations(ctx, initialPieces, controlledRandom(0.99))
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('makes F7 (the bound singular) a shielder of some black king', () => {
    const blackKings = [...result.entries()].filter(([, c]) => c === pieceCode(Board.BLACK, Board.KING))
    const f7IsShielder = blackKings.some(([kPos]) =>
      shieldingPositions({ board: boardFrom(result), targetPosition: kPos, team: Board.BLACK }).includes(F7)
    )
    expect(f7IsShielder).toBe(true)
  })
})

describe('satisfyRelations — shield variant: moved-as-attacker', () => {
  let result
  beforeEach(() => {
    const movedPiece = {
      team: Board.BLACK, species_set: new Set([Board.ROOK]),
      region: { kind: 'set', squares: new Set([D4]) }
    }
    const initialPieces = new Map([[D4, pieceCode(Board.BLACK, Board.ROOK)]])
    const ctx = {
      singulars: { moved_piece: movedPiece },
      propositions: [],
      relations: [relation('shield', {
        subjectTeam: Board.WHITE, subjectSpecies: [Board.PAWN],
        targetTeam:  Board.WHITE, targetSpecies:  [Board.QUEEN]
      })]
    }
    result = satisfyRelations(ctx, initialPieces, controlledRandom(0.99))
  })

  it('returns a non-null result', () => {
    expect(result).not.toBeNull()
  })

  it('keeps moved_piece (black rook) at D4 as the attacker', () => {
    expect(result.get(D4)).toBe(pieceCode(Board.BLACK, Board.ROOK))
  })

  it('builds a shield where the white queen has a shielder on a rook ray from D4', () => {
    const queenPos = findOne(result, pieceCode(Board.WHITE, Board.QUEEN))
    const shielders = shieldingPositions({ board: boardFrom(result), targetPosition: queenPos, team: Board.WHITE })
    expect(shielders.length).toBeGreaterThan(0)
  })
})
