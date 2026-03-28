class NotationParser {
  parse(notation) {
    const trimmedNotation = notation.trim()
    const moveNumberMatch = trimmedNotation.match(/^(\d+)\.\s+/)
    const moveNumber = moveNumberMatch ? Number(moveNumberMatch[1]) : null
    let coreNotation = trimmedNotation.replace(/^\d+\.\s+/, '')

    let mate = false
    let check = false
    if (coreNotation.endsWith('#')) {
      mate = true
      coreNotation = coreNotation.slice(0, -1)
    } else if (coreNotation.endsWith('+')) {
      check = true
      coreNotation = coreNotation.slice(0, -1)
    }

    let enPassant = false
    if (coreNotation.endsWith('e.p.')) {
      enPassant = true
      coreNotation = coreNotation.slice(0, -4)
    }

    let promotion = null
    const promotionMatch = coreNotation.match(/=([QRNB])$/)
    if (promotionMatch) {
      promotion = promotionMatch[1]
      coreNotation = coreNotation.slice(0, -2)
    }

    if (coreNotation === 'O-O' || coreNotation === 'O-O-O') {
      return {
        moveNumber,
        castle: coreNotation,
        pieceType: 'K',
        capture: false,
        destination: null,
        promotion,
        enPassant,
        check,
        mate,
        disambiguation: { file: null, rank: null, square: null }
      }
    }

    const destinationMatch = coreNotation.match(/([a-h][1-8])$/)
    if (!destinationMatch) {
      throw new Error(`Unable to parse notation destination: ${notation}`)
    }

    const destination = destinationMatch[1]
    let prefix = coreNotation.slice(0, -2)
    const capture = prefix.includes('x')
    prefix = prefix.replace('x', '')

    let pieceType = 'P'
    if (/^[KQRNB]/.test(prefix)) {
      pieceType = prefix[0]
      prefix = prefix.slice(1)
    }

    const disambiguation = { file: null, rank: null, square: null }
    if (prefix.length === 2 && /^[a-h][1-8]$/.test(prefix)) {
      disambiguation.square = prefix
      disambiguation.file = prefix[0]
      disambiguation.rank = prefix[1]
    } else if (prefix.length === 1 && /^[a-h]$/.test(prefix)) {
      disambiguation.file = prefix
    } else if (prefix.length === 1 && /^[1-8]$/.test(prefix)) {
      disambiguation.rank = prefix
    } else if (prefix.length > 0) {
      throw new Error(`Unable to parse notation disambiguation: ${notation}`)
    }

    return {
      moveNumber,
      castle: null,
      pieceType,
      capture,
      destination,
      promotion,
      enPassant,
      check,
      mate,
      disambiguation
    }
  }

  equivalent(leftNotation, rightNotation) {
    const left = this.parse(leftNotation)
    const right = this.parse(rightNotation)

    return (
      left.castle === right.castle &&
      left.pieceType === right.pieceType &&
      left.capture === right.capture &&
      left.destination === right.destination &&
      left.promotion === right.promotion &&
      left.enPassant === right.enPassant &&
      left.check === right.check &&
      left.mate === right.mate &&
      left.disambiguation.file === right.disambiguation.file &&
      left.disambiguation.rank === right.disambiguation.rank &&
      left.disambiguation.square === right.disambiguation.square
    )
  }
}

export default NotationParser
