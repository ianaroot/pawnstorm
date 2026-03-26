 import Board from "gameplay/board"

export function squareClassification({ board, position, movingTeam }) {

    const pieceObject = board.pieceObject(position)
    const pieceType = Board.parseSpecies(pieceObject)
    const teamString = Board.parseTeam(pieceObject)
    return {
        position,
        pieceObject: pieceObject,
        pieceType: pieceType,
        teamString: teamString,
        isEmpty: teamString === Board.EMPTY,
        isTeammate: teamString === movingTeam,
        isOpponent: teamString !== Board.EMPTY && teamString !== movingTeam
    }
}

export function validDiagonal(startPosition, candidatePosition) {
    return (
        Board._inBounds(candidatePosition) &&
        Math.abs((candidatePosition % 8) - (startPosition % 8)) === 1
    )
}

export function pawnAttackPositions({ board, startPosition }) {
    const teamString = board.teamAt(startPosition)

    if (teamString === Board.WHITE) {
        const left = startPosition + 7
        const right = startPosition + 9
        return {
            left: validDiagonal(startPosition, left) ? left : null,
            right: validDiagonal(startPosition, right) ? right : null
        }
    }

    if (teamString === Board.BLACK) {
        const left = startPosition - 9
        const right = startPosition - 7
        return {
            left: validDiagonal(startPosition, left) ? left : null,
            right: validDiagonal(startPosition, right) ? right : null
        }
    }

    return {
        left: null,
        right: null
    }
}

function knightControlsSquare(attackerPosition, targetPosition) {
    const fileDiff = Math.abs((targetPosition % 8) - (attackerPosition % 8))
    const rankDiff = Math.abs(Math.floor(targetPosition / 8) - Math.floor(attackerPosition / 8))
    return (fileDiff === 1 && rankDiff === 2) || (fileDiff === 2 && rankDiff === 1)
}

function kingControlsSquare(attackerPosition, targetPosition) {
    const fileDiff = Math.abs((targetPosition % 8) - (attackerPosition % 8))
    const rankDiff = Math.abs(Math.floor(targetPosition / 8) - Math.floor(attackerPosition / 8))
    return Math.max(fileDiff, rankDiff) === 1
}

function pawnControlsSquare({ board, attackerPosition, targetPosition }) {
    const attacks = pawnAttackPositions({ board, startPosition: attackerPosition })
    return attacks.left === targetPosition || attacks.right === targetPosition
}

function rookControlsSquare({ board, attackerPosition, targetPosition }) {
    if (attackerPosition === targetPosition) return false

    const attackerFile = attackerPosition % 8
    const targetFile = targetPosition % 8
    const attackerRank = Math.floor(attackerPosition / 8)
    const targetRank = Math.floor(targetPosition / 8)

    if (attackerFile !== targetFile && attackerRank !== targetRank) { return false }

    let step
    if (attackerFile === targetFile) {
        step = targetPosition > attackerPosition ? 8 : -8
    } else { //same rank not file
        step = targetPosition > attackerPosition ? 1 : -1
    }

    return squaresBetweenClear({ board, attackerPosition, targetPosition, step })
}

function squaresBetweenClear({ board, attackerPosition, targetPosition, step }) {
    for (let current = attackerPosition + step; current !== targetPosition; current += step) {
        if (!board.positionEmpty(current)) {
        return false
        }
    }
    return true
}

function bishopControlsSquare({ board, attackerPosition, targetPosition }) {
    if (attackerPosition === targetPosition) return false

    const fileDiff = (targetPosition % 8) - (attackerPosition % 8)
    const rankDiff = Math.floor(targetPosition / 8) - Math.floor(attackerPosition / 8)

    if (Math.abs(fileDiff) !== Math.abs(rankDiff)) {
        return false
    }

    let step
    if (fileDiff > 0 && rankDiff > 0) step = 9
    if (fileDiff < 0 && rankDiff > 0) step = 7
    if (fileDiff > 0 && rankDiff < 0) step = -7
    if (fileDiff < 0 && rankDiff < 0) step = -9

    return squaresBetweenClear({ board, attackerPosition, targetPosition, step })
}


export function pieceControlsSquare({ board, attackerPosition, targetPosition }) {
    const attacker = board.pieceObject(attackerPosition)
    const attackerTeam = Board.parseTeam(attacker)
    const attackerType = Board.parseSpecies(attacker)

    if (attackerTeam === Board.EMPTY) {
        return false
    }

    switch (attackerType) {
        case Board.NIGHT:
        return knightControlsSquare(attackerPosition, targetPosition)
        case Board.KING:
        return kingControlsSquare(attackerPosition, targetPosition)
        case Board.PAWN:
        return pawnControlsSquare({ board, attackerPosition, targetPosition })
        case Board.ROOK:
        return rookControlsSquare({ board, attackerPosition, targetPosition })
        case Board.BISHOP:
        return bishopControlsSquare({ board, attackerPosition, targetPosition })
        case Board.QUEEN:
        return (
            rookControlsSquare({ board, attackerPosition, targetPosition }) ||
            bishopControlsSquare({ board, attackerPosition, targetPosition })
        )
        default:
        return false
    }
}