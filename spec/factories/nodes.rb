FactoryBot.define do
  factory :node do
    node_type { "condition" }
    position_x { 100.0 }
    position_y { 100.0 }
    data do
      case node_type
      when "condition"
        {
          version: 2,
          kind: "unary",
          subject: "moved_piece",
          subjectFilter: "any",
          subjectFilterMode: "include",
          operator: "value",
          comparator: "greater_than",
          comparisonValue: 0
        }
      when "action"
        {
          actionType: "add",
          value: 1
        }
      when "organizer"
        {
          title: "",
          notes: ""
        }
      else
        {}
      end
    end
    association :bot

    trait :condition do
      node_type { "condition" }
      data do
        {
          version: 2,
          kind: "unary",
          subject: "moved_piece",
          subjectFilter: "any",
          subjectFilterMode: "include",
          operator: "value",
          comparator: "greater_than",
          comparisonValue: 0
        }
      end
    end

    trait :relational_condition do
      node_type { "condition" }
      data do
        {
          version: 2,
          kind: "relational",
          subject: "moved_piece",
          subjectFilter: "any",
          subjectFilterMode: "include",
          operator: "attack",
          target: "enemy",
          targetFilter: "any",
          targetFilterMode: "include",
          subjectComparisonMetric: nil,
          subjectComparator: nil,
          subjectComparisonValue: nil,
          targetComparisonMetric: nil,
          targetComparator: nil,
          targetComparisonValue: nil
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
      data { { title: "", notes: "" } }
    end
  end
end
