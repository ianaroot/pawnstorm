import Board from "gameplay/board"
import profileCollector from "gameplay/profile_collector"


// -------------------  INTERNAL HELPERS ----------------------------------- // 

const ROOK_RAY_STEPS = [1, -1, 8, -8]
const BISHOP_RAY_STEPS = [7, -7, 9, -9]
const QUEEN_RAY_STEPS = [...ROOK_RAY_STEPS, ...BISHOP_RAY_STEPS]

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
    return QUEEN_RAY_STEPS
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
    if (board.teamAt(position) !== opposingTeam) { return false }
    const pieceType = board.pieceTypeAt(position)
    const isStraight = ROOK_RAY_STEPS.includes(step)
    const isDiagonal = BISHOP_RAY_STEPS.includes(step)
    if (pieceType === Board.QUEEN) { return true }
    if (pieceType === Board.ROOK) { return isStraight }
    if (pieceType === Board.BISHOP) { return isDiagonal }
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
    return profileCollector.measure('board_query.coverer_on_ray', () => {
        const blockerPosition = firstOccupiedOnRay({ board, startPosition: targetPosition, step })

        if (blockerPosition === null || board.teamAt(blockerPosition) !== team) {
            return null
        }

        const firstSquareBeyondBlocker = nextPositionOnRay(blockerPosition, step)
        if (firstSquareBeyondBlocker === null) {
            return null
        }

        const potentialAttacker = hasPotentialSliderPressureBeyondCover({ board, blockerPosition, team, step })
        if (potentialAttacker) {
            return blockerPosition
        }

        return null
    })
}

function cachedValue({ cache, cacheType, cacheKey, compute }) {
    if (!cache) {
        return compute()
    }

    if (!cache[cacheType]) {
        cache[cacheType] = new Map()
    }

    const bucket = cache[cacheType]
    if (bucket.has(cacheKey)) {
        return bucket.get(cacheKey)
    }

    const value = compute()
    bucket.set(cacheKey, value)
    return value
}

function cachedCovererOnRay({ board, targetPosition, team, step, cache = null, cacheScope = 'after' }) {
    return cachedValue({
        cache,
        cacheType: 'covererOnRay',
        cacheKey: `${cacheScope}:${targetPosition}:${team}:${step}`,
        compute: () => covererOnRay({ board, targetPosition, team, step })
    })
}

function buildCoverMap({ board, team, cache = null, cacheScope = 'after' }) {
    return cachedValue({
        cache,
        cacheType: 'coverMap',
        cacheKey: `${cacheScope}:${team}`,
        compute: () => {
            const targetToCoverers = new Map()
            const sourceToCoveredTargets = new Map()
            const alliedPositions = board._positionsOccupiedByTeam(team)
            alliedPositions.forEach((targetPosition) => {
                const coverers = new Set()
                raySteps().forEach((step) => {
                    const blockerPosition = cachedCovererOnRay({ board, targetPosition, team, step, cache, cacheScope })
                    if (blockerPosition === null) { return }
                    coverers.add(blockerPosition)
                })
                const covererList = Array.from(coverers)
                targetToCoverers.set(targetPosition, covererList)
                covererList.forEach((sourcePosition) => {
                    if (!sourceToCoveredTargets.has(sourcePosition)) {
                        sourceToCoveredTargets.set(sourcePosition, [])
                    }
                    sourceToCoveredTargets.get(sourcePosition).push(targetPosition)
                })
            })

            return {
                targetToCoverers,
                sourceToCoveredTargets
            }
        }
    })
}

function hasPotentialSliderPressureBeyondCover({ board, blockerPosition, team, step }) {
    return profileCollector.measure('board_query.potential_slider_pressure_beyond_cover', () => {
        const opposingTeam = Board.opposingTeam(team)
        const farSideSquares = squaresBeyondBlockerOnRay(blockerPosition, step)

        if (farSideSquares.length === 0) {
            return false
        }

        const enemySliders = board._positionsOccupiedByTeam(opposingTeam).filter((position) => {
            return compatibleSliderOnRay({ board, position, step, opposingTeam })
        })

        return enemySliders.some((sliderPosition) => {
            return sliderCanReachFarSideSquareWithoutCrossingBlocker({
                board,
                sliderPosition,
                blockerPosition,
                farSideSquares
            })
        })
    })
}

function sliderCouldReachSquareForCover({ board, sliderPosition, targetSquare }) {
    const pieceType = board.pieceTypeAt(sliderPosition)
    const sliderFile = sliderPosition % 8
    const targetFile = targetSquare % 8
    const sliderRank = Math.floor(sliderPosition / 8)
    const targetRank = Math.floor(targetSquare / 8)

    const sameFile = sliderFile === targetFile
    const sameRank = sliderRank === targetRank
    const fileDiff = Math.abs(sliderFile - targetFile)
    const rankDiff = Math.abs(sliderRank - targetRank)
    const sameDiagonal = fileDiff === rankDiff

    const geometricallyReachable =
        (pieceType === Board.ROOK && (sameFile || sameRank)) ||
        (pieceType === Board.BISHOP && sameDiagonal) ||
        (pieceType === Board.QUEEN && (sameFile || sameRank || sameDiagonal))

    if (!geometricallyReachable) {
        return false
    } else {
        return true
    }

    
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

function knightControlledSquares(attackerPosition) {
    const candidates = [
        attackerPosition + 17,
        attackerPosition + 15,
        attackerPosition + 10,
        attackerPosition + 6,
        attackerPosition - 6,
        attackerPosition - 10,
        attackerPosition - 15,
        attackerPosition - 17
    ]
    return candidates.filter((targetPosition) => {
        if ( !Board._inBounds(targetPosition) ) { return false }
        const fileDiff = Math.abs((targetPosition % 8) - (attackerPosition % 8))
        const rankDiff = Math.abs(Math.floor(targetPosition / 8) - Math.floor(attackerPosition / 8))
        return ( fileDiff === 1 && rankDiff === 2 ) || ( fileDiff === 2 && rankDiff === 1 )
    })
}

function kingControlledSquares(attackerPosition) {
    const candidates = [
        attackerPosition + 1,
        attackerPosition - 1,
        attackerPosition + 8,
        attackerPosition - 8,
        attackerPosition + 7,
        attackerPosition - 7,
        attackerPosition + 9,
        attackerPosition - 9
    ]
    return candidates.filter(( targetPosition ) => {
        if ( !Board._inBounds( targetPosition ) ) { return false }
        const fileDiff = Math.abs(( targetPosition % 8 ) - ( attackerPosition % 8 ))
        const rankDiff = Math.abs( Math.floor(targetPosition / 8 ) - Math.floor( attackerPosition / 8 ))
        return Math.max( fileDiff, rankDiff ) === 1
    })
}

function rayControlledSquares({ board, attackerPosition, step }) {
    const controlled = []
    for (
        let current = nextPositionOnRay( attackerPosition, step );
        current !== null;
        current = nextPositionOnRay( current, step )
    ) {
        controlled.push( current )
        if (!board.positionEmpty( current )) { break }
    }
    return controlled
}

function sliderControlledSquares({ board, attackerPosition, steps }) {
    return steps.flatMap((step) => {
        return rayControlledSquares({ board, attackerPosition, step })
    })
}

function sourceShieldsTarget({ board, sourcePosition, targetPosition, team }) {
    if (sourcePosition === targetPosition) { return false }

    const opposingTeam = Board.opposingTeam(team)
    const sliderPositions = board._positionsOccupiedByTeam(opposingTeam).filter(position => {
        const pieceType = board.pieceTypeAt(position)
        return pieceType === Board.ROOK || pieceType === Board.BISHOP || pieceType === Board.QUEEN
    })

    return sliderPositions.some((attackerPosition) => {
        if (!sliderCouldAttackAlongLine({ board, attackerPosition, targetPosition })) { return false }
        const occupiedBetween = positionsBetween(attackerPosition, targetPosition).filter(position => {
            return !board.positionEmpty(position)
        })
        return occupiedBetween.length === 1 && occupiedBetween[0] === sourcePosition
    })
}

function sourceCoversTarget({ board, sourcePosition, targetPosition, team }) {
    if (sourcePosition === targetPosition) { return false }

    return raySteps().some((step) => {
        return covererOnRay({ board, targetPosition, team, step }) === sourcePosition
    })
}

function squaresBeyondBlockerOnRay(blockerPosition, step) {
    const squares = []
    for (
        let current = nextPositionOnRay(blockerPosition, step);
        current !== null;
        current = nextPositionOnRay(current, step)
    ) {
        squares.push(current)
    }
    return squares
}

function pathToTargetSquareClearsBlocker({ board, sliderPosition, targetSquare, blockerPosition }) {
    const step = sliderStep(sliderPosition, targetSquare)
    if (step === null) {
        return false
    }

    for (let current = sliderPosition + step; current !== targetSquare; current += step) {
        if (current === blockerPosition) {
            return false
        }
    }

    return true
}

function sliderCanReachFarSideSquareWithoutCrossingBlocker({
    board,
    sliderPosition,
    blockerPosition,
    farSideSquares
}) {
    return farSideSquares.some((targetSquare) => {
        if (!sliderCouldReachSquareForCover({ board, sliderPosition, targetSquare })) {
            return false
        }

        return pathToTargetSquareClearsBlocker({
            board,
            sliderPosition,
            targetSquare,
            blockerPosition
        })
    })
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
    return profileCollector.measure('board_query.adjacent_positions', () => {
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
    })
}

export function adjacentCount(args) {
    return adjacentPositions(args).length
}

export function shieldingPositions({ board, targetPosition, team, species = null }) {
    return profileCollector.measure('board_query.shielding_positions', () => {
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
    })
}

export function coveringPositions({ board, targetPosition, team, species = null, cache = null, cacheScope = 'after' }) {
    return profileCollector.measure('board_query.covering_positions', () => {
        const { targetToCoverers } = buildCoverMap({ board, team, cache, cacheScope })
        const covering = targetToCoverers.get(targetPosition) || []

        if (species === null) {
            return covering
        }

        return covering.filter((position) => board.pieceTypeAt(position) === species)
    })
}

export function shieldedPositions({ board, sourcePosition, team, species = null }) {
    return profileCollector.measure('board_query.shielded_positions', () => {
        return board._positionsOccupiedByTeam(team).filter(targetPosition => {
            if (targetPosition === sourcePosition) {
                return false
            }

            if (species !== null && board.pieceTypeAt(targetPosition) !== species) {
                return false
            }

            return sourceShieldsTarget({ board, sourcePosition, targetPosition, team })
        })
    })
}

export function coveredPositions({ board, sourcePosition, team, species = null, cache = null, cacheScope = 'after' }) {
    return profileCollector.measure('board_query.covered_positions', () => {
        const { sourceToCoveredTargets } = buildCoverMap({ board, team, cache, cacheScope })
        const covered = sourceToCoveredTargets.get(sourcePosition) || []

        if (species === null) {
            return covered
        }

        return covered.filter((position) => board.pieceTypeAt(position) === species)
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
    return profileCollector.measure('board_query.controlled_squares', () => {
        const attacker = board.pieceObject(attackerPosition)
        if (Board.parseTeam(attacker) === Board.EMPTY) {
            return []
        }
        switch (Board.parseSpecies(attacker)) {
            case Board.PAWN: {
                const attacks = pawnAttackPositions({ board, startPosition: attackerPosition })
                return [attacks.left, attacks.right].filter(position => position !== null)
            }
            case Board.NIGHT:
                return knightControlledSquares(attackerPosition)
            case Board.KING:
                return kingControlledSquares(attackerPosition)
            case Board.ROOK:
                return sliderControlledSquares({ board, attackerPosition, steps: ROOK_RAY_STEPS })
            case Board.BISHOP:
                return sliderControlledSquares({ board, attackerPosition, steps: BISHOP_RAY_STEPS })
            case Board.QUEEN:
                return sliderControlledSquares({ board, attackerPosition, steps: QUEEN_RAY_STEPS })
            default:
                return []
        }
    })
}
