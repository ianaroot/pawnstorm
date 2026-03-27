import Board from "gameplay/board"


// -------------------  INTERNAL HELPERS ----------------------------------- // 

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

function sliderStep(attackerPosition, targetPosition) {
    const fileDiff = (targetPosition % 8) - (attackerPosition % 8)
    const rankDiff = Math.floor(targetPosition / 8) - Math.floor(attackerPosition / 8)

    if (fileDiff === 0 && rankDiff !== 0) {
        return rankDiff > 0 ? 8 : -8
    }

    if (rankDiff === 0 && fileDiff !== 0) {
        return fileDiff > 0 ? 1 : -1
    }

    if (Math.abs(fileDiff) === Math.abs(rankDiff)) {
        if (fileDiff > 0 && rankDiff > 0) return 9
        if (fileDiff < 0 && rankDiff > 0) return 7
        if (fileDiff > 0 && rankDiff < 0) return -7
        if (fileDiff < 0 && rankDiff < 0) return -9
    }

    return null
}

function sliderCouldAttackAlongLine({ board, attackerPosition, targetPosition }) {
    const attackerType = board.pieceTypeAt(attackerPosition)
    const step = sliderStep(attackerPosition, targetPosition)

    if (step === null) {
        return false
    }

    const isStraight = Math.abs(step) === 1 || Math.abs(step) === 8
    const isDiagonal = Math.abs(step) === 7 || Math.abs(step) === 9

    if (attackerType === Board.ROOK) {
        return isStraight
    }

    if (attackerType === Board.BISHOP) {
        return isDiagonal
    }

    if (attackerType === Board.QUEEN) {
        return isStraight || isDiagonal
    }

    return false
}

function positionsBetween(attackerPosition, targetPosition) {
    const step = sliderStep(attackerPosition, targetPosition)
    if (step === null) {
        return []
    }

    const between = []

    for (let current = attackerPosition + step; current !== targetPosition; current += step) {
        between.push(current)
    }

    return between
}

function raySteps() {
    return [1, -1, 8, -8, 7, -7, 9, -9]
}

function nextPositionOnRay(position, step) {
    const nextPosition = position + step
    if (!Board._inBounds(nextPosition)) {
        return null
    }

    const currentFile = position % 8
    const nextFile = nextPosition % 8

    if (Math.abs(step) === 1 && Math.abs(nextFile - currentFile) !== 1) {
        return null
    }

    if ((Math.abs(step) === 7 || Math.abs(step) === 9) && Math.abs(nextFile - currentFile) !== 1) {
        return null
    }

    return nextPosition
}

function compatibleSliderOnRay({ board, position, step, opposingTeam }) {
    if (board.teamAt(position) !== opposingTeam) {
        return false
    }

    const pieceType = board.pieceTypeAt(position)
    const isStraight = Math.abs(step) === 1 || Math.abs(step) === 8
    const isDiagonal = Math.abs(step) === 7 || Math.abs(step) === 9

    if (pieceType === Board.QUEEN) {
        return true
    }

    if (pieceType === Board.ROOK) {
        return isStraight
    }

    if (pieceType === Board.BISHOP) {
        return isDiagonal
    }

    return false
}

function firstOccupiedOnRay({ board, startPosition, step }) {
    for (let current = nextPositionOnRay(startPosition, step); current !== null; current = nextPositionOnRay(current, step)) {
        if (!board.positionEmpty(current)) {
            return current
        }
    }

    return null
}

function covererOnRay({ board, targetPosition, team, step }) {
    const opposingTeam = Board.opposingTeam(team)
    const blockerPosition = firstOccupiedOnRay({ board, startPosition: targetPosition, step })

    if (blockerPosition === null || board.teamAt(blockerPosition) !== team) {
        return null
    }

    const firstSquareBeyondBlocker = nextPositionOnRay(blockerPosition, step)
    if (firstSquareBeyondBlocker === null) {
        return null
    }

    const beyondBlocker = firstOccupiedOnRay({ board, startPosition: blockerPosition, step })

    if (beyondBlocker === null) {
        return blockerPosition
    }

    if (compatibleSliderOnRay({ board, position: beyondBlocker, step, opposingTeam })) {
        return blockerPosition
    }

    return null
}

function pieceValue(species) {
    switch (species) {
        case Board.PAWN:
        return 1
        case Board.NIGHT:
        case Board.BISHOP:
        return 3
        case Board.ROOK:
        return 5
        case Board.QUEEN:
        return 9
        case Board.KING:
        return Infinity
        default:
        return 0
    }
}

// -------------------  EXPORTED HELPERS ----------------------------------- // 

export function materialValue(pieceObjectOrSpecies) {
    const species = pieceObjectOrSpecies.length === 2 ? Board.parseSpecies(pieceObjectOrSpecies) : pieceObjectOrSpecies
    return pieceValue(species)
}

export function defendingPositions({ board, targetPosition, team, species = null }) {
    return controllingPositions({ board, targetPosition, team, species }).filter(position => position !== targetPosition)
}

export function attackingPositions({ board, targetPosition, team, species = null }) {
    return controllingPositions({ board, targetPosition, team, species })
}

export function defenderCount(args) {
    return defendingPositions(args).length
}

export function attackerCount(args) {
    return attackingPositions(args).length
}

export function adjacentPositions({ board, targetPosition, team, species = null }) {
    return board._positionsOccupiedByTeam(team).filter(position => {
        if (position === targetPosition) {
            return false
        }

        const fileDiff = Math.abs((targetPosition % 8) - (position % 8))
        const rankDiff = Math.abs(Math.floor(targetPosition / 8) - Math.floor(position / 8))

        if (Math.max(fileDiff, rankDiff) !== 1) {
            return false
        }

        if (species !== null && board.pieceTypeAt(position) !== species) {
            return false
        }

        return true
    })
}

export function adjacentCount(args) {
    return adjacentPositions(args).length
}

export function shieldingPositions({ board, targetPosition, team, species = null }) {
    const opposingTeam = Board.opposingTeam(team)
    const sliderPositions = board._positionsOccupiedByTeam(opposingTeam).filter(position => {
        const pieceType = board.pieceTypeAt(position)
        return pieceType === Board.ROOK || pieceType === Board.BISHOP || pieceType === Board.QUEEN
    })

    const shielding = new Set()

    sliderPositions.forEach(attackerPosition => {
        if (!sliderCouldAttackAlongLine({ board, attackerPosition, targetPosition })) {
            return
        }

        const occupiedBetween = positionsBetween(attackerPosition, targetPosition).filter(position => {
            return !board.positionEmpty(position)
        })

        if (occupiedBetween.length !== 1) {
            return
        }

        const blockerPosition = occupiedBetween[0]
        if (board.teamAt(blockerPosition) !== team) {
            return
        }

        if (species !== null && board.pieceTypeAt(blockerPosition) !== species) {
            return
        }

        shielding.add(blockerPosition)
    })

    return Array.from(shielding)
}

export function coveringPositions({ board, targetPosition, team, species = null }) {
    const covering = new Set()

    raySteps().forEach(step => {
        const blockerPosition = covererOnRay({ board, targetPosition, team, step })
        if (blockerPosition === null) {
            return
        }

        if (species !== null && board.pieceTypeAt(blockerPosition) !== species) {
            return
        }

        covering.add(blockerPosition)
    })

    return Array.from(covering)
}

export function shieldedPositions({ board, sourcePosition, team, species = null }) {
    return board._positionsOccupiedByTeam(team).filter(targetPosition => {
        if (targetPosition === sourcePosition) {
            return false
        }

        if (species !== null && board.pieceTypeAt(targetPosition) !== species) {
            return false
        }

        return shieldingPositions({ board, targetPosition, team }).includes(sourcePosition)
    })
}

export function coveredPositions({ board, sourcePosition, team, species = null }) {
    return board._positionsOccupiedByTeam(team).filter(targetPosition => {
        if (targetPosition === sourcePosition) {
            return false
        }

        if (species !== null && board.pieceTypeAt(targetPosition) !== species) {
            return false
        }

        return coveringPositions({ board, targetPosition, team }).includes(sourcePosition)
    })
}

export function shielderCount(args) {
    return shieldingPositions(args).length
}

export function shieldedCount(args) {
    return shieldedPositions(args).length
}

export function covererCount(args) {
    return coveringPositions(args).length
}

export function coveredCount(args) {
    return coveredPositions(args).length
}

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


export function controllingPositions({ board, targetPosition, team, species = null }) {
    const positions = board._positionsOccupiedByTeam(team)

    return positions.filter((attackerPosition) => {
        if (species !== null && board.pieceTypeAt(attackerPosition) !== species) {
        return false
        }

        return pieceControlsSquare({ board, attackerPosition, targetPosition })
    })
}

export function controlledSquares({ board, attackerPosition }) {
    const attacker = board.pieceObject(attackerPosition)

    if (Board.parseTeam(attacker) === Board.EMPTY) {
        return []
    }

    const controlled = []

    for (let targetPosition = 0; targetPosition < 64; targetPosition++) {
        if (pieceControlsSquare({ board, attackerPosition, targetPosition })) {
            controlled.push(targetPosition)
        }
    }

    return controlled
}
