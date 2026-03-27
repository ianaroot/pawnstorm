class Match < ApplicationRecord
  # TODO: Discuss Match model implementation
  # 
  # Current state: This model exists but is completely unused.
  # Matches are handled purely client-side in game_controller.js.
  # 
  # Questions to address:
  # 1. Should we persist match state to database?
  # 2. Should we track match history/results for bot performance analysis?
  # 3. Do we want multiplayer support requiring server-side game state?
  # 4. Should we remove this model entirely if it remains unused?
  # 
  # If implementing persistence, consider:
  # - Match state serialization (board position, move history)
  # - Bot vs bot match results
  # - User match history
  # - Replay functionality
  #
  # If removing, also remove:
  # - matches table migration
  # - MatchesController
  # - routes for matches
  
  belongs_to :bot_1, class_name: :Bot
  belongs_to :bot_2, class_name: :Bot
end
