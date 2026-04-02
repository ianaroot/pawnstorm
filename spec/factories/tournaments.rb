FactoryBot.define do
  factory :tournament do
    association :creator, factory: :user
    games_per_pair { 10 }
  end

  factory :tournament_entry do
    association :tournament
    association :bot
    sequence(:seed_order)
  end
end
