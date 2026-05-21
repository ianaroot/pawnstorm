import { describe, expect, it } from 'vitest'
import Board from 'gameplay/board'
import { actorTeam } from 'bot_execution/actor_teams'

describe('actorTeam', () => {
  describe('with WHITE moving', () => {
    const movingTeam = Board.WHITE

    it('returns movingTeam for allied', () => {
      expect(actorTeam('allied', movingTeam)).toBe(Board.WHITE)
    })

    it('returns movingTeam for moved_piece', () => {
      expect(actorTeam('moved_piece', movingTeam)).toBe(Board.WHITE)
    })

    it('returns enemyTeam for captured_piece', () => {
      expect(actorTeam('captured_piece', movingTeam)).toBe(Board.BLACK)
    })

    it('returns enemyTeam for enemy', () => {
      expect(actorTeam('enemy', movingTeam)).toBe(Board.BLACK)
    })

    it('returns enemyTeam for enemy_moved_piece', () => {
      expect(actorTeam('enemy_moved_piece', movingTeam)).toBe(Board.BLACK)
    })

    it('returns movingTeam for enemy_captured_piece', () => {
      expect(actorTeam('enemy_captured_piece', movingTeam)).toBe(Board.WHITE)
    })
  })

  describe('with BLACK moving', () => {
    const movingTeam = Board.BLACK

    it('returns movingTeam for allied', () => {
      expect(actorTeam('allied', movingTeam)).toBe(Board.BLACK)
    })

    it('returns movingTeam for moved_piece', () => {
      expect(actorTeam('moved_piece', movingTeam)).toBe(Board.BLACK)
    })

    it('returns enemyTeam for captured_piece', () => {
      expect(actorTeam('captured_piece', movingTeam)).toBe(Board.WHITE)
    })

    it('returns enemyTeam for enemy', () => {
      expect(actorTeam('enemy', movingTeam)).toBe(Board.WHITE)
    })

    it('returns enemyTeam for enemy_moved_piece', () => {
      expect(actorTeam('enemy_moved_piece', movingTeam)).toBe(Board.WHITE)
    })

    it('returns movingTeam for enemy_captured_piece', () => {
      expect(actorTeam('enemy_captured_piece', movingTeam)).toBe(Board.BLACK)
    })
  })
})
