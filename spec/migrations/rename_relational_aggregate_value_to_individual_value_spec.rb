require 'rails_helper'

# §4 migration. Canonical target the §3 implementation must create:
#   db/migrate/20260515120000_rename_relational_aggregate_value_to_individual_value.rb
#   class RenameRelationalAggregateValueToIndividualValue
# Guarded so the absent migration fails these examples individually
# (NEW-TDD-RED) rather than aborting the whole suite at load.
begin
  require Rails.root.join(
    'db', 'migrate', '20260515120000_rename_relational_aggregate_value_to_individual_value'
  )
rescue LoadError
  nil
end

RSpec.describe 'RenameRelationalAggregateValueToIndividualValue (§4 migration)', type: :model do
  let(:migration) { RenameRelationalAggregateValueToIndividualValue.new }

  # Persist a legacy pre-§3B row, bypassing the (post-§3B) validation that
  # would reject aggregate_value.
  def legacy_node(data)
    node = create(:node, :condition)
    node.update_column(:data, data)
    node
  end

  it 'rewrites a relational subject aggregate_value to individual_value' do
    node = legacy_node(
      'version' => 2, 'kind' => 'relational',
      'subject' => 'allied', 'subjectFilter' => 'any',
      'operator' => 'attack', 'target' => 'enemy', 'targetFilter' => 'any',
      'subjectComparisonMetric' => 'aggregate_value',
      'subjectComparator' => 'greater_than',
      'subjectComparisonSource' => 'exact_number',
      'subjectComparisonSourceTotal' => 0
    )

    migration.up

    expect(node.reload.data['subjectComparisonMetric']).to eq('individual_value')
  end

  it 'rewrites a relational target aggregate_value to individual_value' do
    node = legacy_node(
      'version' => 2, 'kind' => 'relational',
      'subject' => 'allied', 'subjectFilter' => 'any',
      'operator' => 'attack', 'target' => 'enemy', 'targetFilter' => 'any',
      'targetComparisonMetric' => 'aggregate_value',
      'targetComparator' => 'greater_than',
      'targetComparisonSource' => 'exact_number',
      'targetComparisonSourceTotal' => 0
    )

    migration.up

    expect(node.reload.data['targetComparisonMetric']).to eq('individual_value')
  end

  it 'leaves relational count and individual_value nodes untouched' do
    count_node = legacy_node(
      'version' => 2, 'kind' => 'relational',
      'subject' => 'allied', 'subjectFilter' => 'any',
      'operator' => 'attack', 'target' => 'enemy', 'targetFilter' => 'any',
      'subjectComparisonMetric' => 'count',
      'subjectComparator' => 'greater_than',
      'subjectComparisonSource' => 'exact_number',
      'subjectComparisonSourceTotal' => 0
    )
    individual_node = legacy_node(
      'version' => 2, 'kind' => 'relational',
      'subject' => 'allied', 'subjectFilter' => 'any',
      'operator' => 'attack', 'target' => 'enemy', 'targetFilter' => 'any',
      'subjectComparisonMetric' => 'individual_value',
      'subjectComparator' => 'greater_than',
      'subjectComparisonSource' => 'exact_number',
      'subjectComparisonSourceTotal' => 0
    )

    migration.up

    expect(count_node.reload.data['subjectComparisonMetric']).to eq('count')
    expect(individual_node.reload.data['subjectComparisonMetric']).to eq('individual_value')
  end

  it 'is idempotent on re-run' do
    node = legacy_node(
      'version' => 2, 'kind' => 'relational',
      'subject' => 'allied', 'subjectFilter' => 'any',
      'operator' => 'attack', 'target' => 'enemy', 'targetFilter' => 'any',
      'subjectComparisonMetric' => 'aggregate_value',
      'subjectComparator' => 'greater_than',
      'subjectComparisonSource' => 'exact_number',
      'subjectComparisonSourceTotal' => 0
    )

    migration.up
    first = node.reload.data
    migration.up

    expect(node.reload.data).to eq(first)
    expect(node.reload.data['subjectComparisonMetric']).to eq('individual_value')
  end
end
