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

    trait :human_vs_bot do
      white_player { create(:user) }
      black_player { create(:bot, :compiled) }
      creator { white_player }
      black_compiled_program_snapshot { black_player.compiled_program }
    end

    trait :completed do
      status { :completed }
      result { :white_win }
      movement_notation { ['1. Nf3'] }
      lay_out { Array.new(64, 'ee') }
    end

    trait :failed do
      status { :failed }
      result { :error }
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
