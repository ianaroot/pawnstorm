import Board from 'gameplay/board'
import { materialValue } from 'gameplay/board_query_utils'
import { compareValues } from 'bot_execution/utils'
import { qualifyingSquares } from 'editorV2/panels/condition_preview/shared/unary_position_collection'
import { intersectRegions, subtractRegions } from './region'

const ALL_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const CAPTURABLE_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN])

const SINGULAR_ACTORS = new Set(['moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'])

const ACTOR_PRIORITY = Object.freeze({
  moved_piece: 0,
  enemy_moved_piece: 1,
  captured_piece: 2,
  enemy_captured_piece: 3
})

export function buildSingulars(combinedPlan) {
  const singulars = initSingulars(combinedPlan)
  for (const plan of combinedPlan.plans) {
    narrowSingulars(plan, singulars)
  }
  return singulars
}

function initSingulars(combinedPlan) {
  const { movingTeam, enemyTeam } = combinedPlan
  return {
    moved_piece:          { ...singular(movingTeam, ALL_SPECIES), priorRegion: { kind: 'all' } },
    captured_piece:       singular(enemyTeam,  [null, ...CAPTURABLE_SPECIES]),
    enemy_moved_piece:    singular(enemyTeam,  [null, ...ALL_SPECIES]),
    enemy_captured_piece: singular(movingTeam, [null, ...CAPTURABLE_SPECIES])
  }
}

function singular(team, species) {
  return {
    team,
    species_set: new Set(species),
    region: { kind: 'all' },
    relationsToAnchors: []
  }
}

function narrowSingulars(plan, singulars) {
  if (plan.kind === 'relational') {
    if (SINGULAR_ACTORS.has(plan.subject)) {
      narrowSingularByFilterPool(singulars[plan.subject], plan.subjectSpeciesPool)
    }
    if (SINGULAR_ACTORS.has(plan.target)) {
      narrowSingularByFilterPool(singulars[plan.target], plan.targetSpeciesPool)
    }
    if (plan.operator === 'same_piece') {
      aliasSingulars(plan.subject, plan.target, singulars)
      return
    }
    if (SINGULAR_ACTORS.has(plan.subject) && SINGULAR_ACTORS.has(plan.target)) {
      addRelationToAnchorOnLowerPriority(plan, singulars)
    }
    return
  }
  if (!SINGULAR_ACTORS.has(plan.subject)) { return }
  if (plan.kind === 'position') {
    narrowSingularByPositionPlan(plan, singulars[plan.subject])
  } else if (plan.kind === 'unary') {
    narrowSingularByUnaryPlan(plan, singulars[plan.subject])
  }
}

function narrowSingularByFilterPool(target, speciesPool) {
  if (!speciesPool) { return }
  intersectSpeciesSet(target.species_set, new Set(speciesPool))
}

function addRelationToAnchorOnLowerPriority(plan, singulars) {
  const { subject, target, operator } = plan
  const lower = ACTOR_PRIORITY[subject] > ACTOR_PRIORITY[target] ? subject : target
  const higher = lower === subject ? target : subject
  const myRole = lower === subject ? 'subject' : 'target'
  singulars[lower].relationsToAnchors.push({ otherActor: higher, operator, myRole })
}

function aliasSingulars(actorA, actorB, singulars) {
  if (!SINGULAR_ACTORS.has(actorA) || !SINGULAR_ACTORS.has(actorB)) { return }
  const a = singulars[actorA]
  const b = singulars[actorB]
  const merged = {
    team: a.team,
    species_set: intersectedSet(a.species_set, b.species_set),
    region: intersectRegions(a.region, b.region),
    relationsToAnchors: [...(a.relationsToAnchors ?? []), ...(b.relationsToAnchors ?? [])]
  }
  merged.species_set.delete(null)
  singulars[actorA] = merged
  singulars[actorB] = merged
}

function intersectedSet(a, b) {
  const result = new Set()
  for (const s of a) {
    if (b.has(s)) { result.add(s) }
  }
  return result
}

function narrowSingularByUnaryPlan(plan, target) {
  if (plan.operator === 'count') {
    narrowSingularByCountPlan(plan, target)
  } else if (plan.operator === 'value') {
    narrowSingularByValuePlan(plan, target)
  }
}

function narrowSingularByCountPlan(plan, target) {
  const total = Number(plan.targetTotal ?? 0)
  const lowerBound = lowerBoundFromComparator(plan.comparator, total)
  const pool = new Set(plan.subjectSpeciesPool)
  if (lowerBound !== null && lowerBound > 0) {
    intersectSpeciesSet(target.species_set, pool)
  } else if (plan.comparator === 'equal_to' && total === 0) {
    subtractSpeciesSet(target.species_set, pool)
  }
}

function narrowSingularByValuePlan(plan, target) {
  const total = Number(plan.targetTotal ?? 0)
  const filterPool = new Set(plan.subjectSpeciesPool)
  const valuePool = new Set(ALL_SPECIES.filter(s => compareValues(materialValue(s), plan.comparator, total)))
  intersectSpeciesSet(target.species_set, filterPool)
  intersectSpeciesSet(target.species_set, valuePool)
}

function intersectSpeciesSet(speciesSet, pool) {
  for (const s of [...speciesSet]) {
    if (!pool.has(s)) { speciesSet.delete(s) }
  }
}

function subtractSpeciesSet(speciesSet, pool) {
  for (const s of pool) {
    speciesSet.delete(s)
  }
}

function narrowSingularByPositionPlan(plan, target) {
  const total = Number(plan.targetTotal ?? 0)
  const lowerBound = lowerBoundFromComparator(plan.comparator, total)
  const qualifying = {
    kind: 'set',
    squares: new Set(qualifyingSquares(plan.positionAxis, plan.positionComparator, plan.positionTarget, plan.movingTeam))
  }
  if (lowerBound !== null && lowerBound > 0) {
    target.region = intersectRegions(target.region, qualifying)
    intersectSpeciesSet(target.species_set, new Set(plan.subjectSpeciesPool))
  } else if (plan.comparator === 'equal_to' && total === 0) {
    target.region = subtractRegions(target.region, qualifying)
  }
}

function lowerBoundFromComparator(comparator, total) {
  switch (comparator) {
    case 'equal_to':                 return total
    case 'greater_than':             return total + 1
    case 'greater_than_or_equal_to': return total
    case 'less_than':
    case 'less_than_or_equal_to':    return null
  }
  return null
}
