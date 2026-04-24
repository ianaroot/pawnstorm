require 'rails_helper'

RSpec.describe Tournaments::StartTournament do
  include ActiveJob::TestHelper

  before do
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
  end

  let(:creator) { create(:user) }
  let(:tournament) { create(:tournament, creator: creator, visibility: :public, games_per_pair: 2, status: :open) }
  let(:bot_a) { create(:bot, :compiled, user: creator, name: 'Alpha') }
  let(:bot_b) { create(:bot, :compiled, user: creator, name: 'Beta') }
  let(:bot_c) { create(:bot, :compiled, user: creator, name: 'Gamma') }

  def create_entry(bot, seed_order:)
    create(
      :tournament_entry,
      tournament: tournament,
      bot: bot,
      bot_owner: creator,
      display_name: bot.name,
      compiled_program_snapshot: bot.compiled_program,
      seed_order: seed_order
    )
  end

  describe '#call' do
    it 'starts an open tournament with existing entries and enqueues up to the running match limit' do
      entry_a = create_entry(bot_a, seed_order: 8)
      entry_b = create_entry(bot_b, seed_order: 4)
      entry_c = create_entry(bot_c, seed_order: 2)
      service = described_class.new(user: creator, tournament: tournament)

      expect_any_instance_of(Bot).not_to receive(:get_fresh_program)

      expect do
        expect(service.call).to be(true)
      end.to change(Match, :count).by(6)

      expect(tournament.reload.status).to eq('running')
      expect(tournament.started_at).to be_present
      expect(tournament.tournament_entries.reload.map(&:seed_order)).to eq([0, 1, 2])
      expect([entry_a.reload.seed_order, entry_b.reload.seed_order, entry_c.reload.seed_order]).to eq([0, 1, 2])

      matches = tournament.matches.includes(:white_tournament_entry, :black_tournament_entry).to_a
      expect(matches).to all(have_attributes(white_tournament_entry: be_present, black_tournament_entry: be_present))
      expect(matches.map(&:creator)).to all(eq(creator))

      pair_counts = matches.group_by do |match|
        [match.white_tournament_entry_id, match.black_tournament_entry_id].sort
      end.transform_values(&:count)
      expect(pair_counts).to eq({
        [entry_a.id, entry_b.id] => 2,
        [entry_a.id, entry_c.id] => 2,
        [entry_b.id, entry_c.id] => 2
      })

      [[entry_a, entry_b], [entry_a, entry_c], [entry_b, entry_c]].each do |white_first_entry, black_first_entry|
        expect(matches.count do |match|
          match.white_tournament_entry == white_first_entry && match.black_tournament_entry == black_first_entry
        end).to eq(1)
        expect(matches.count do |match|
          match.white_tournament_entry == black_first_entry && match.black_tournament_entry == white_first_entry
        end).to eq(1)
      end

      expect(enqueued_jobs.size).to eq(Tournament::MAX_RUNNING_MATCHES)
      expect(enqueued_jobs.map { |job| job[:args].first }).to match_array(
        tournament.matches.order(:created_at).limit(Tournament::MAX_RUNNING_MATCHES).pluck(:id)
      )
      expect(tournament.matches.queued.count).to eq(Tournament::MAX_RUNNING_MATCHES)
      expect(tournament.matches.pending.count).to eq(tournament.matches.count - Tournament::MAX_RUNNING_MATCHES)
    end

    it 'rejects non-creators' do
      create_entry(bot_a, seed_order: 0)
      create_entry(bot_b, seed_order: 1)
      service = described_class.new(user: create(:user), tournament: tournament)

      expect(service.call).to be(false)
      expect(service.error_message).to eq('Only the tournament creator can start this tournament.')
    end

    it 'rejects non-open tournaments' do
      create_entry(bot_a, seed_order: 0)
      create_entry(bot_b, seed_order: 1)
      tournament.update!(status: :running)
      service = described_class.new(user: creator, tournament: tournament)

      expect(service.call).to be(false)
      expect(service.error_message).to eq('Only open tournaments can be started.')
    end

    it 'rejects tournaments with fewer than two entries' do
      create_entry(bot_a, seed_order: 0)
      service = described_class.new(user: creator, tournament: tournament)

      expect(service.call).to be(false)
      expect(service.error_message).to eq('At least two entries are required to start a tournament.')
      expect(tournament.reload.status).to eq('open')
    end

    it 'commits the starting status before generating matches and reopens if generation fails' do
      create_entry(bot_a, seed_order: 0)
      create_entry(bot_b, seed_order: 1)
      service = described_class.new(user: creator, tournament: tournament)

      allow(Match).to receive(:create!) do
        expect(tournament.reload.status).to eq('starting')
        raise 'match generation failed'
      end

      expect do
        expect(service.call).to be(false)
      end.not_to change(Match, :count)

      expect(service.error_message).to eq('match generation failed')
      expect(tournament.reload.status).to eq('open')
      expect(tournament.started_at).to be_nil
      expect(ComputeMatchJob).not_to have_been_enqueued
    end

    it 'uses entry snapshots even when the bot program changes after entry' do
      entry = create_entry(bot_a, seed_order: 0)
      create_entry(bot_b, seed_order: 1)
      original_snapshot = entry.compiled_program_snapshot.deep_dup
      bot_a.update_columns(compiled_program: { root: 'changed' }, compiled_program_stale: false)
      service = described_class.new(user: creator, tournament: tournament)

      expect(service.call).to be(true)
      expect(entry.reload.compiled_program_snapshot).to eq(original_snapshot)
      match = tournament.matches.order(:created_at).first
      expect([match.white_tournament_entry, match.black_tournament_entry]).to include(entry)
    end
  end
end
