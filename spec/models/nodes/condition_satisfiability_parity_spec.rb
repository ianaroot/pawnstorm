require 'rails_helper'

# Shared impossible/possible payloads asserted against both the Ruby validator
# (Nodes::ConditionSatisfiability) and the JS preview detectors. The same file
# feeds app/javascript/.../__tests__/contradictions_parity.test.js, so the two
# parallel sources of truth can't drift on these cases. The Ruby side pins the
# exact reason; the JS side checks the verdict. Drift cases (Ruby's
# vacuous/negative rejections) live in the per-language specs.
RSpec.describe 'condition satisfiability parity' do
  parity_cases = JSON.parse(File.read(Rails.root.join('spec/fixtures/condition_satisfiability_parity.json')))
  satisfiable_cases = parity_cases.select { |parity_case| parity_case['satisfiable'] }
  unsatisfiable_cases = parity_cases.reject { |parity_case| parity_case['satisfiable'] }

  it 'allows every satisfiable parity case' do
    aggregate_failures do
      satisfiable_cases.each do |parity_case|
        reasons = Nodes::ConditionSatisfiability.reasons(parity_case['data'])
        expect(reasons).to(be_empty, "expected '#{parity_case['name']}' to be satisfiable, got: #{reasons}")
      end
    end
  end

  it 'rejects every unsatisfiable parity case with the expected reason' do
    aggregate_failures do
      unsatisfiable_cases.each do |parity_case|
        expected = Nodes::ConditionSatisfiability::REASONS.fetch(parity_case['reasonKey'].to_sym)
        reasons = Nodes::ConditionSatisfiability.reasons(parity_case['data'])
        expect(reasons).to(include(expected), "expected '#{parity_case['name']}' to be rejected for #{parity_case['reasonKey']}, got: #{reasons}")
      end
    end
  end
end
