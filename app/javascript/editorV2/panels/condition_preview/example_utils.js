import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { originCandidatesForSpecies } from 'editorV2/panels/condition_preview/geometry_utils'
import {
  square, clonePiecesMap, squareIsOccupied, buildLayoutFromPieces, buildBoardFromLayout,
  pieceCode, pieceSpecies, pieceTeam, shuffled, layoutsMatch
} from 'editorV2/panels/condition_preview/board_utils'

export const MOVE_KIND_STANDARD = 'standard'
export const MOVE_KIND_CASTLE = 'castle'

const DISPLAY_SPECIES = Object.freeze([Board.PAWN, Board.NIGHT, Board.BISHOP, Board.ROOK, Board.QUEEN, Board.KING])
const KING_CANDIDATE_POSITIONS = Object.freeze([
  square('b1'), square('g1'), square('a1'), square('h1'), square('c1'), square('f1'),
  square('b8'), square('g8'), square('a8'), square('h8'), square('c8'), square('f8')
])

export function speciesMatchesFilter(species, filter = 'any', filterMode = null) {
  if (filter === 'any') { return true }

  let matches
  switch (filter) {
    case 'king':
      matches = species === Board.KING
      break
    case 'queen':
      matches = species === Board.QUEEN
      break
    case 'rook':
      matches = species === Board.ROOK
      break
    case 'bishop':
      matches = species === Board.BISHOP
      break
    case 'knight':
      matches = species === Board.NIGHT
      break
    case 'pawn':
      matches = species === Board.PAWN
      break
    case 'major':
      matches = species === Board.ROOK || species === Board.QUEEN
      break
    case 'minor':
      matches = species === Board.NIGHT || species === Board.BISHOP
      break
    default:
      matches = false
  }

  return filterMode === 'exclude' ? !matches : matches
}

export function candidateSpecies(filter = 'any', filterMode = null) {
  const pool = (filter === 'king' && filterMode !== 'exclude') ? [Board.KING] : [...DISPLAY_SPECIES]
  return pool.filter(species => speciesMatchesFilter(species, filter, filterMode))
}

export function selectKingPair(basePieces, random) {
  const existingWhiteKings = []
  const existingBlackKings = []

  basePieces.forEach((piece, position) => {
    if (pieceSpecies(piece) !== Board.KING) { return }
    if (pieceTeam(piece) === Board.WHITE) {
      existingWhiteKings.push(position)
    } else if (pieceTeam(piece) === Board.BLACK) {
      existingBlackKings.push(position)
    }
  })

  if (existingWhiteKings.length > 1 || existingBlackKings.length > 1) { return null }

  const whiteCandidates = existingWhiteKings.length > 0
    ? existingWhiteKings
    : shuffled(KING_CANDIDATE_POSITIONS, random).filter(position => !squareIsOccupied(basePieces, position))
  const blackCandidates = existingBlackKings.length > 0
    ? existingBlackKings
    : shuffled(KING_CANDIDATE_POSITIONS, random).filter(position => !squareIsOccupied(basePieces, position))

  for (let whiteIndex = 0; whiteIndex < whiteCandidates.length; whiteIndex += 1) {
    const whiteKing = whiteCandidates[whiteIndex]
    if (existingWhiteKings.length === 0 && squareIsOccupied(basePieces, whiteKing)) { continue }

    for (let blackIndex = 0; blackIndex < blackCandidates.length; blackIndex += 1) {
      const blackKing = blackCandidates[blackIndex]
      if (whiteKing === blackKing) { continue }
      if (existingBlackKings.length === 0 && squareIsOccupied(basePieces, blackKing)) { continue }

      const fileDiff = Math.abs(Board.fileIndex(whiteKing) - Board.fileIndex(blackKing))
      const rankDiff = Math.abs(Board.rankIndex(whiteKing) - Board.rankIndex(blackKing))
      if (Math.max(fileDiff, rankDiff) <= 1) { continue }

      const pieces = clonePiecesMap(basePieces)
      if (existingWhiteKings.length === 0) {
        pieces.set(whiteKing, pieceCode(Board.WHITE, Board.KING))
      }
      if (existingBlackKings.length === 0) {
        pieces.set(blackKing, pieceCode(Board.BLACK, Board.KING))
      }

      return pieces
    }
  }

  return null
}

export function collectLegalReverseMoves({ afterPieces, movedPieceSquare, movedPieceSpecies, recentMoveContext, random, maxResults }) {
  const piecesWithKings = selectKingPair(afterPieces, random)
  if (!piecesWithKings) { return [] }

  const afterLayout = buildLayoutFromPieces(piecesWithKings)
  const afterBoard = buildBoardFromLayout(afterLayout, recentMoveContext)

  const originCandidates = shuffled(originCandidatesForSpecies(movedPieceSquare, movedPieceSpecies), random)
  const moves = []
  for (let index = 0; index < originCandidates.length; index += 1) {
    const originPosition = originCandidates[index]
    if (piecesWithKings.has(originPosition)) { continue }

    const priorPieces = clonePiecesMap(piecesWithKings)
    priorPieces.delete(movedPieceSquare)
    priorPieces.set(originPosition, pieceCode(Board.WHITE, movedPieceSpecies))
    const priorLayout = buildLayoutFromPieces(priorPieces)
    const priorBoard = buildBoardFromLayout(priorLayout, recentMoveContext)

    let moveObject
    try {
      moveObject = Rules.getMoveObject(originPosition, movedPieceSquare, priorBoard)
    } catch {
      continue
    }
    if (moveObject.illegal || moveObject.additionalActions || moveObject.promotionPiece || moveObject.captureNotation) { continue }
    if (!legalPriorTurnState(priorBoard, moveObject)) { continue }

    const rebuiltAfter = priorBoard.lightClone()
    rebuiltAfter._hypotheticallyMovePiece(moveObject)
    if (!layoutsMatch(rebuiltAfter.layOut, afterLayout)) { continue }

    moves.push({ priorBoard, moveObject, afterBoard })
    if (moves.length >= maxResults) { break }
  }

  return moves
}

export function legalPriorTurnState(priorBoard, moveObject) {
  const movedTeam = priorBoard.teamAt(moveObject.startPosition)
  if (!movedTeam) { return false }

  const opposingTeam = Board.opposingTeam(movedTeam)
  return !Rules.checkQuery({ board: priorBoard, teamString: opposingTeam })
}

export function moveKindForMoveObject(moveObject) {
  if (/^O-O/.test(moveObject.pieceNotation || '')) { return MOVE_KIND_CASTLE }
  return MOVE_KIND_STANDARD
}

export function soundForMove(priorBoard, afterBoard, moveObject) {
  const movedTeam = priorBoard.teamAt(moveObject.startPosition)
  const opposingTeam = Board.opposingTeam(movedTeam)
  if (Rules.checkQuery({ board: afterBoard, teamString: opposingTeam })) { return 'check' }
  if (priorBoard.layOut[moveObject.endPosition] !== Board.EMPTY_SQUARE) { return 'capture' }
  return 'move'
}

export function candidateIdentity(example) {
  const subjectSig = example.result.subjectPositions.map(p => example.afterBoard.pieceTypeAt(p)).join(',')
  const targetSig = example.result.targetPositions.map(p => example.afterBoard.pieceTypeAt(p)).join(',')
  return [
    example.moveKind || MOVE_KIND_STANDARD,
    example.moveObject.startPosition,
    example.moveObject.endPosition,
    example.geometryKey,
    subjectSig,
    targetSig,
    example.variantType
  ].join(':')
}
