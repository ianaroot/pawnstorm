module TournamentsHelper
  CONSTRAINT_COST_LABELS = {
    "score_node"           => "Score node",
    "census_condition"     => "Positions",
    "relational_condition" => "Attack/Defend",
    "identity_condition"   => "Captures",
    "and"                  => "AND",
    "or"                   => "OR"
  }.freeze

  CONSTRAINT_CONDITION_KIND_LABELS = {
    "census"     => "Positions",
    "relational" => "Attack/Defend",
    "identity"   => "Captures"
  }.freeze

  def constraint_cost_labels
    CONSTRAINT_COST_LABELS
  end

  def constraint_condition_kind_labels
    CONSTRAINT_CONDITION_KIND_LABELS
  end
end
