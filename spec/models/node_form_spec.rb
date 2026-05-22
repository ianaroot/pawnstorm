require 'rails_helper'

RSpec.describe NodeForm, type: :model do
  describe '.comparison_metric_options' do
    it 'offers count and value (individual_value) but never aggregate_value' do
      options = described_class.comparison_metric_options

      expect(options).to include(['Count', 'count'])
      expect(options).to include(['Value', 'individual_value'])
      expect(options.map(&:last)).not_to include('aggregate_value')
    end
  end
end
