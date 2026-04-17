FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }

    trait :guest do
      sequence(:email) { |n| "guest-#{n}@guest.local" }
      guest { true }
      last_active_at { Time.current }
    end
  end
end
