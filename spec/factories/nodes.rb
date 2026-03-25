FactoryBot.define do
  factory :node do
    node_type { "condition" }
    position_x { 100.0 }
    position_y { 100.0 }
    data do
      {
        subject: "moved_piece",
        specifier: "any",
        relation: "attacker_count",
        comparison: "any",
        comparisonValue: nil
      }
    end
    association :bot

    trait :condition do
      node_type { "condition" }
      data do
        {
          subject: "moved_piece",
          specifier: "any",
          relation: "attacker_count",
          comparison: "any",
          comparisonValue: nil
        }
      end
    end

    trait :action do
      node_type { "action" }
      data { { actionType: "add", value: 1 } }
    end

    trait :root do
      node_type { "root" }
      data { {} }
    end
    
    trait :organizer do
      node_type { "organizer" }
      data { {} }
    end
  end
end
