module Tournaments
  class CreateTournament < TournamentWriter
    FORM_FIELDS = %i[name description visibility entries_per_user max_entries games_per_pair constraints].freeze

    attr_reader :tournament

    FORM_FIELDS.each { |field| define_method(field) { @attributes[field] } }

    def initialize(user:, params:)
      @user = user
      @attributes = tournament_attributes(params, parsed_games_per_pair(params[:games_per_pair]))
    end

    def call
      @tournament = Tournament.new(@attributes.merge(creator: @user, status: :draft))

      if games_per_pair > MAX_GAMES_PER_PAIR
        @tournament.errors.add(:base, "Games per pairing cannot exceed #{MAX_GAMES_PER_PAIR}.")
        return fail_with(@tournament.errors.full_messages.to_sentence)
      end

      return true if @tournament.save

      fail_with(@tournament.errors.full_messages.to_sentence)
    end
  end
end
