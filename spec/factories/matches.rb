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
  end
end
