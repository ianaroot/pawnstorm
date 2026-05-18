import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { chooseRelationVariant } from '../relations/relation_variants'
// Board.NIGHT is the knight species token (no Board.NIGHT).
import { defaultTestCtx } from './_helpers'

function sq(file, rank) { return rank * 8 + file }

function singular(team, species, position) {
  return {
    team,
    species_set: new Set([species]),
    region: { kind: 'set', squares: new Set([position]) }
  }
}

// Singular present but not committed to a single square — singularPosition
// returns null, so it cannot anchor.
function unpositionedSingular(team, species) {
  return { team, species_set: new Set([species]), region: { kind: 'all' } }
}

function role(name, { team, species, boundSingularActor = null }) {
  return {
    name,
    side: {
      team,
      species_set: new Set(Array.isArray(species) ? species : [species]),
      boundSingularActor
    }
  }
}

// Deterministic uniform-pick: chooseRelationVariant indexes
// eligible[floor(random() * eligible.length)]. r selects that index.
const pick = r => () => r
const W = Board.WHITE
const B = Board.BLACK
const SLIDERS = [Board.BISHOP, Board.ROOK, Board.QUEEN]

describe('chooseRelationVariant — bound forcing', () => {
  it('forces the role whose bound singular is positioned', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(2, 3)) }
    })
    const roles = [
      role('subject', { team: W, species: Board.NIGHT, boundSingularActor: 'moved_piece' }),
      role('target', { team: W, species: Board.BISHOP })
    ]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0) })
    expect(v.kind).toBe('bound')
    expect(v.bindings).toEqual([
      { role: 'subject', actorKey: 'moved_piece', position: sq(2, 3) }
    ])
  })

  it('returns ALL forced bindings when multiple roles are bound to positioned singulars', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: singular(W, Board.NIGHT, sq(2, 3)),
        enemy_moved_piece: singular(B, Board.ROOK, sq(4, 4))
      }
    })
    const roles = [
      role('subject', { team: W, species: Board.NIGHT, boundSingularActor: 'moved_piece' }),
      role('target', { team: B, species: Board.ROOK, boundSingularActor: 'enemy_moved_piece' })
    ]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0) })
    expect(v.kind).toBe('bound')
    expect(v.bindings).toEqual([
      { role: 'subject', actorKey: 'moved_piece', position: sq(2, 3) },
      { role: 'target', actorKey: 'enemy_moved_piece', position: sq(4, 4) }
    ])
  })

  it('does NOT force a bound role whose singular is unpositioned (falls through to non-bound)', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: unpositionedSingular(W, Board.NIGHT) }
    })
    const roles = [
      role('subject', { team: W, species: Board.NIGHT, boundSingularActor: 'moved_piece' }),
      role('target', { team: W, species: Board.BISHOP })
    ]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0) })
    expect(v.kind).toBe('bystander')
  })

  it('bound takes precedence — no bystander/moved options mixed in', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(2, 3)) }
    })
    const roles = [
      role('subject', { team: W, species: Board.NIGHT, boundSingularActor: 'moved_piece' }),
      role('target', { team: W, species: Board.NIGHT })
    ]
    // Even picking the "last" eligible index must still be the bound result.
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.99) })
    expect(v.kind).toBe('bound')
  })
})

describe('chooseRelationVariant — non-bound eligibility', () => {
  it('offers moved-as-role when team and committed species match', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(1, 0)) }
    })
    const roles = [
      role('subject', { team: W, species: Board.NIGHT }),
      role('target', { team: B, species: Board.QUEEN })
    ]
    // eligible = [bystander, moved->subject]; index 1 selects the moved variant.
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.5) })
    expect(v).toEqual({
      kind: 'moved', role: 'subject', actorKey: 'moved_piece', position: sq(1, 0)
    })
  })

  it('excludes a role on team mismatch', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(1, 0)) }
    })
    const roles = [role('target', { team: B, species: Board.NIGHT })]
    // Team mismatch -> only bystander eligible.
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.99) })
    expect(v.kind).toBe('bystander')
  })

  it('excludes a role on committed-species mismatch', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.PAWN, sq(1, 0)) }
    })
    const roles = [role('subject', { team: W, species: Board.NIGHT })]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.99) })
    expect(v.kind).toBe('bystander')
  })

  it('considers enemy_moved_piece, tagged with kind "enemy-moved"', () => {
    const ctx = defaultTestCtx({
      singulars: { enemy_moved_piece: singular(B, Board.ROOK, sq(7, 7)) }
    })
    const roles = [role('target', { team: B, species: Board.ROOK })]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.5) })
    expect(v).toEqual({
      kind: 'enemy-moved', role: 'target', actorKey: 'enemy_moved_piece', position: sq(7, 7)
    })
  })

  it('skips an actor whose species is uncommitted (null)', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: { team: W, species_set: new Set([null]), region: { kind: 'set', squares: new Set([sq(1, 0)]) } }
      }
    })
    const roles = [role('subject', { team: W, species: Board.NIGHT })]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.99) })
    expect(v.kind).toBe('bystander')
  })

  it('skips an actor that is not positioned (cannot anchor)', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: unpositionedSingular(W, Board.NIGHT) }
    })
    const roles = [role('subject', { team: W, species: Board.NIGHT })]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.99) })
    expect(v.kind).toBe('bystander')
  })

  it('bystander is always eligible and is index 0 (random()=0 yields bystander)', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(1, 0)) }
    })
    const roles = [role('subject', { team: W, species: Board.NIGHT })]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0) })
    expect(v.kind).toBe('bystander')
  })

  it('both pool actors can be offered for the same role (uniform over eligible)', () => {
    const ctx = defaultTestCtx({
      singulars: {
        moved_piece: singular(W, Board.ROOK, sq(0, 0)),
        enemy_moved_piece: singular(W, Board.ROOK, sq(0, 7))
      }
    })
    const roles = [role('subject', { team: W, species: Board.ROOK })]
    // eligible = [bystander, moved->subject, enemy-moved->subject]
    expect(chooseRelationVariant({ roles, ctx, random: pick(0) }).kind).toBe('bystander')
    expect(chooseRelationVariant({ roles, ctx, random: pick(0.4) }).kind).toBe('moved')
    expect(chooseRelationVariant({ roles, ctx, random: pick(0.9) }).kind).toBe('enemy-moved')
  })
})

describe('chooseRelationVariant — role-count agnostic', () => {
  it('handles a 3-role shield-shaped input incl. synthetic attacker side', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(B, Board.ROOK, sq(3, 3)) }
    })
    const roles = [
      role('shielder', { team: W, species: Board.BISHOP }),
      role('shielded', { team: W, species: Board.ROOK }),
      // synthetic attacker: opposing team, slider species, never bound
      role('attacker', { team: B, species: SLIDERS })
    ]
    // moved is B ROOK -> matches only the attacker role.
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.5) })
    expect(v).toEqual({
      kind: 'moved', role: 'attacker', actorKey: 'moved_piece', position: sq(3, 3)
    })
  })

  it('accepts a PBS-entry-shaped role (no boundSingularActor key) without refactor', () => {
    const ctx = defaultTestCtx({
      singulars: { moved_piece: singular(W, Board.NIGHT, sq(2, 2)) }
    })
    // Mirrors a cross-frame entry's subject/target proposition: {team, species_set}
    // with no boundSingularActor field at all.
    const roles = [
      { name: 'subject', side: { team: W, species_set: new Set([Board.NIGHT]) } },
      { name: 'target', side: { team: B, species_set: new Set([Board.QUEEN]) } }
    ]
    const v = chooseRelationVariant({ roles, ctx, random: pick(0.5) })
    expect(v).toEqual({
      kind: 'moved', role: 'subject', actorKey: 'moved_piece', position: sq(2, 2)
    })
  })
})
