FactoryBot.define do
  factory :bot do
    sequence(:name) { |n| "Bot #{n}" }
    description { "A test bot for playing chess" }
    association :user

    trait :compiled do
      after(:create) do |bot|
        bot.update_columns(
          compiled_program: { root: 'root', nodes: {} },
          compiled_program_stale: false
        )
        bot.reload
      end
    end

    trait :with_nodes do
      after(:create) do |bot|
        create_list(:node, 3, bot: bot)
      end
    end
  end
end
