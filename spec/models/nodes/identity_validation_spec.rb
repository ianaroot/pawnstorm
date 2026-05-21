require 'rails_helper'

# NEW-TDD-RED: DataValidator only knows kind ∈ {unary, relational, position}.
# Until the validator/grammar accept identity, every "is valid" expectation
# below fails with "has invalid kind: identity". The identity payload is
# minimal — version, kind, subject, target only — mirroring today's
# validate_v2_same_piece_relational! constraints.
RSpec.describe 'identity condition validation', type: :model do
  def condition(data)
    build(:node, :condition, data: data)
  end

  it 'accepts the minimal identity payload' do
    node = condition(
      version: 2, kind: 'identity',
      subject: 'enemy_moved_piece', target: 'captured_piece'
    )

    expect(node).to be_valid
  end

  it 'accepts the reversed minimal identity payload' do
    node = condition(
      version: 2, kind: 'identity',
      subject: 'captured_piece', target: 'enemy_moved_piece'
    )

    expect(node).to be_valid
  end

  it 'normalizes filter/comparison keys away to the minimal identity payload' do
    node = condition(
      version: 2, kind: 'identity',
      subject: 'enemy_moved_piece', target: 'captured_piece',
      subjectFilter: 'queen', subjectFilterMode: 'include'
    )

    expect(node).to be_valid
    expect(node.data.keys).to match_array(%w[version kind subject target])
  end

  it 'rejects an identity subject/target pair that is not a same_piece pairing' do
    node = condition(
      version: 2, kind: 'identity',
      subject: 'allied', target: 'enemy'
    )

    expect(node).not_to be_valid
  end
end
