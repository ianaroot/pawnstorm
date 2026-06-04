FactoryBot.define do
  factory :match do
    association :creator, factory: :user
    white_player { create(:bot) }
    black_player { create(:bot) }

    trait :white_human do
      white_player { create(:user) }
    end

    trait :black_human do
      black_player { create(:user) }
    end

    trait :tournament_game do
      association :tournament
      creator { tournament.creator }
      white_player { white_tournament_entry&.bot || create(:bot) }
      black_player { black_tournament_entry&.bot || create(:bot) }
      allowed_to_move { 'W' }
      captured_pieces { [] }
      movement_notation { ['1. Nf3'] }
      previous_layouts { [] }
      lay_out { Array.new(64, 'ee') }
    end
  end
end
