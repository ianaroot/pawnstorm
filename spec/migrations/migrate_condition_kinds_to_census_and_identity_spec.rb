require 'rails_helper'

# NEW-TDD-RED: the kind-unification data migration.
# Canonical target the implementation must create:
#   db/migrate/20260516120000_migrate_condition_kinds_to_census_and_identity.rb
#   class MigrateConditionKindsToCensusAndIdentity
# Guarded so the absent migration fails these examples individually
# (NEW-TDD-RED) rather than aborting the whole suite at load.
begin
  require Rails.root.join(
    'db', 'migrate', '20260516120000_migrate_condition_kinds_to_census_and_identity'
  )
rescue LoadError
  nil
end

RSpec.describe 'MigrateConditionKindsToCensusAndIdentity', type: :model do
  let(:migration) { MigrateConditionKindsToCensusAndIdentity.new }

  # Persist a row bypassing validation (the post-migration validator no longer
  # accepts kind: unary/position/relational+same_piece).
  def legacy_node(data)
    node = create(:node, :condition)
    node.update_column(:data, data)
    node
  end

  it 'rewrites a unary node to census, preserving the rest of the payload byte-for-byte' do
    node = legacy_node(
      'version' => 2, 'kind' => 'unary', 'subject' => 'allied',
      'subjectFilter' => 'pawn', 'subjectFilterMode' => 'include',
      'operator' => 'value', 'comparator' => 'greater_than',
      'target' => 'exact_number', 'targetTotal' => 6
    )

    migration.up

    expect(node.reload.data).to eq(
      'version' => 2, 'kind' => 'census', 'subject' => 'allied',
      'subjectFilter' => 'pawn', 'subjectFilterMode' => 'include',
      'operator' => 'value', 'comparator' => 'greater_than',
      'target' => 'exact_number', 'targetTotal' => 6
    )
  end

  it 'rewrites a position node to census, preserving the spatial keys' do
    node = legacy_node(
      'version' => 2, 'kind' => 'position', 'subject' => 'allied',
      'subjectFilter' => 'major', 'subjectFilterMode' => 'include',
      'operator' => 'count', 'comparator' => 'equal_to', 'targetTotal' => 2,
      'positionAxis' => 'file', 'positionComparator' => 'equal_to', 'positionTarget' => 4
    )

    migration.up

    expect(node.reload.data).to eq(
      'version' => 2, 'kind' => 'census', 'subject' => 'allied',
      'subjectFilter' => 'major', 'subjectFilterMode' => 'include',
      'operator' => 'count', 'comparator' => 'equal_to', 'targetTotal' => 2,
      'target' => 'exact_number',
      'positionAxis' => 'file', 'positionComparator' => 'equal_to', 'positionTarget' => 4
    )
  end

  it 'reduces a same_piece relational node to the minimal identity payload' do
    node = legacy_node(
      'version' => 2, 'kind' => 'relational', 'subject' => 'enemy_moved_piece',
      'subjectFilter' => 'any', 'operator' => 'same_piece',
      'target' => 'captured_piece', 'targetFilter' => 'any'
    )

    migration.up

    expect(node.reload.data).to eq(
      'version' => 2, 'kind' => 'identity',
      'subject' => 'enemy_moved_piece', 'target' => 'captured_piece'
    )
  end

  it 'leaves non-same_piece relational nodes untouched' do
    node = legacy_node(
      'version' => 2, 'kind' => 'relational', 'subject' => 'allied',
      'subjectFilter' => 'any', 'operator' => 'attack',
      'target' => 'enemy', 'targetFilter' => 'any'
    )

    migration.up

    expect(node.reload.data['kind']).to eq('relational')
    expect(node.reload.data['operator']).to eq('attack')
  end

  it 'is idempotent on re-run' do
    node = legacy_node(
      'version' => 2, 'kind' => 'position', 'subject' => 'allied',
      'subjectFilter' => 'major', 'subjectFilterMode' => 'include',
      'operator' => 'count', 'comparator' => 'equal_to', 'targetTotal' => 2,
      'positionAxis' => 'file', 'positionComparator' => 'equal_to', 'positionTarget' => 4
    )

    migration.up
    first = node.reload.data
    migration.up

    expect(node.reload.data).to eq(first)
    expect(node.reload.data['kind']).to eq('census')
  end
end
