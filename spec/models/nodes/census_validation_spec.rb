require 'rails_helper'

# NEW-TDD-RED: DataValidator only knows kind ∈ {unary, relational, position}.
# Until the validator/grammar accept census, every "is valid" expectation
# below fails with "has invalid kind: census". The off-board-subject rule
# additionally pins that spatial keys are rejected for actors that have no
# board square.
RSpec.describe 'census condition validation', type: :model do
  def condition(data)
    build(:node, :condition, data: data)
  end

  it 'accepts a board-wide census with no spatial keys' do
    node = condition(
      version: 2, kind: 'census', subject: 'allied',
      subjectFilter: 'pawn', subjectFilterMode: 'include',
      operator: 'value', comparator: 'greater_than',
      target: 'exact_number', targetTotal: 6
    )

    expect(node).to be_valid
  end

  it 'accepts a region-restricted census carrying spatial keys' do
    node = condition(
      version: 2, kind: 'census', subject: 'allied',
      subjectFilter: 'major', subjectFilterMode: 'include',
      operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 2,
      positionAxis: 'file', positionComparator: 'equal_to', positionTarget: 4
    )

    expect(node).to be_valid
  end

  it 'accepts a region-restricted census compared against prior_board_state' do
    node = condition(
      version: 2, kind: 'census', subject: 'allied',
      subjectFilter: 'major', subjectFilterMode: 'include',
      operator: 'count', comparator: 'greater_than', target: 'prior_board_state',
      positionAxis: 'rank', positionComparator: 'greater_than_or_equal_to', positionTarget: 5
    )

    expect(node).to be_valid
  end

  it 'rejects spatial keys on an off-board subject that has no board square' do
    node = condition(
      version: 2, kind: 'census', subject: 'captured_piece',
      subjectFilter: 'any',
      operator: 'count', comparator: 'equal_to', target: 'exact_number', targetTotal: 1,
      positionAxis: 'rank', positionComparator: 'equal_to', positionTarget: 4
    )

    expect(node).not_to be_valid
    expect(node.errors[:data]).to include(a_string_matching(/off-board|position|spatial/i))
  end
end
