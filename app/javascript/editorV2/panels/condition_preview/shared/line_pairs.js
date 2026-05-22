import { pathClear, squareCompatibleOrEmpty } from './geometry_utils'

// near, far, slot: { team, speciesSet }

export function singletonsOnLine({ line, slot, pieces }) {
  const result = []
  for (let idx = 0; idx < line.length; idx += 1) {
    if (!pathClear(line, 0, idx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, line[idx], slot.team, slot.speciesSet)) { continue }
    result.push({ idx, pos: line[idx] })
  }
  return result
}

export function pairsOnLine({ line, near, far, pieces }) {
  const result = []
  for (let nearIdx = 0; nearIdx < line.length - 1; nearIdx += 1) {
    if (!pathClear(line, 0, nearIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, line[nearIdx], near.team, near.speciesSet)) { continue }
    for (let farIdx = nearIdx + 1; farIdx < line.length; farIdx += 1) {
      if (!pathClear(line, nearIdx + 1, farIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, line[farIdx], far.team, far.speciesSet)) { continue }
      result.push({ nearIdx, nearPos: line[nearIdx], farIdx, farPos: line[farIdx] })
    }
  }
  return result
}

export function pairsAcrossRays({ nearRay, farRay, near, far, pieces }) {
  const result = []
  for (let nearIdx = 0; nearIdx < nearRay.length; nearIdx += 1) {
    if (!pathClear(nearRay, 0, nearIdx, pieces)) { continue }
    if (!squareCompatibleOrEmpty(pieces, nearRay[nearIdx], near.team, near.speciesSet)) { continue }
    for (let farIdx = 0; farIdx < farRay.length; farIdx += 1) {
      if (!pathClear(farRay, 0, farIdx, pieces)) { continue }
      if (!squareCompatibleOrEmpty(pieces, farRay[farIdx], far.team, far.speciesSet)) { continue }
      result.push({ nearIdx, nearPos: nearRay[nearIdx], farIdx, farPos: farRay[farIdx] })
    }
  }
  return result
}
