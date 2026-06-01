# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Glicko2::Rating do
  describe '#with_inflated_deviation' do
    it 'combines the current deviation with the bump in quadrature' do
      inflated = described_class.new(rating: 1000, deviation: 50, volatility: 0.06)
                                .with_inflated_deviation(250)
      expect(inflated.deviation).to be_within(0.01).of(Math.sqrt(50**2 + 250**2))
    end

    it 'caps the deviation at the default maximum' do
      inflated = described_class.new(rating: 1000, deviation: 300, volatility: 0.06)
                                .with_inflated_deviation(250)
      expect(inflated.deviation).to eq(Glicko2::DEFAULT_DEVIATION)
    end

    it 'leaves rating and volatility untouched' do
      inflated = described_class.new(rating: 1200, deviation: 50, volatility: 0.05)
                                .with_inflated_deviation(250)
      expect(inflated.rating).to eq(1200)
      expect(inflated.volatility).to eq(0.05)
    end
  end
end
