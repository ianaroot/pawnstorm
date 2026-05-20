# Regenerates the match-runner smoke-test fixtures from purpose-built dev bots.
#
# These two bots are kept in the dev DB and deliberately cover every live
# condition kind (census whole-board + region, relational incl. value metrics,
# identity). The compiled programs they produce are committed as fixtures and
# played end-to-end by app/javascript/gameplay/__tests__/match_runner_smoke.test.js
# — the regression net for "compiled program contains a kind the evaluator
# rejects" (the stale-`unary` crash that took down every match with a green
# suite).
#
# This is a generator, not a spec: it depends on the dev DB and is run by hand
# whenever the source bots change. It validates the compiler output at
# generation time so a regenerated fixture can never carry a retired/unknown
# kind into the committed file.
#
#   bin/rails smoke_fixtures:generate

namespace :smoke_fixtures do
  LIVE_KINDS = %w[relational census identity].freeze
  RETIRED_KINDS = %w[unary position].freeze
  FIXTURE_DIR = Rails.root.join("app/javascript/gameplay/__fixtures__")

  SOURCE_BOTS = {
    "test bot 1" => "smoke_white_compiled_program.json",
    "test bot 2" => "smoke_black_compiled_program.json"
  }.freeze

  desc "Regenerate match-runner smoke fixtures from the dev test bots"
  task generate: :environment do
    SOURCE_BOTS.each do |bot_name, filename|
      bot = Bot.find_by(name: bot_name)
      raise "Smoke bot not found: #{bot_name.inspect}" unless bot

      compiled = BotCompiler.new(bot).compile

      kinds = compiled[:nodes].values
        .select { |node| node[:type] == "condition" }
        .map { |node| node[:data][:kind] || node[:data]["kind"] }

      retired = kinds & RETIRED_KINDS
      raise "#{bot_name.inspect} compiles retired kinds: #{retired.uniq.inspect}" if retired.any?

      unknown = kinds.uniq - LIVE_KINDS
      raise "#{bot_name.inspect} compiles unknown kinds: #{unknown.inspect}" if unknown.any?

      path = FIXTURE_DIR.join(filename)
      File.write(path, "#{JSON.pretty_generate(compiled)}\n")

      puts "#{bot_name.inspect} -> #{filename} " \
           "(#{compiled[:nodes].size} nodes, kinds=#{kinds.tally})"
    end
  end
end
