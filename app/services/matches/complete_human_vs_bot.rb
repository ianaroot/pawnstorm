class Matches::CompleteHumanVsBot
  attr_reader :error_message, :match

  def initialize(user:, match_id:, params:)
    @user = user
    @match_id = match_id
    @params = params
  end

  def call
    @match = @user.created_matches.find(@match_id)
    raise ActiveRecord::RecordNotFound unless match.human_vs_bot_for?(@user)

    return true if match.completed? || match.failed?

    case @params[:status]
    when 'failed'
      fail_match
    when 'completed'
      complete_match
    else
      fail_with('Invalid match completion status.')
    end
  end

  private

  def fail_match
    match.update!(
      status: :failed,
      result: :error,
      error_message: @params[:error_message].presence || 'Interactive match failed.'
    )
  end

  def complete_match
    attributes = replay_attributes
    return false unless attributes

    match.update!(attributes)
  end

  def replay_attributes
    {
      status: :completed,
      error_message: nil,
      result: @params.fetch(:result),
      lay_out: @params.fetch(:lay_out),
      captured_pieces: @params.fetch(:captured_pieces),
      allowed_to_move: @params.fetch(:allowed_to_move),
      movement_notation: @params.fetch(:movement_notation),
      previous_layouts: @params.fetch(:previous_layouts)
    }
  rescue KeyError => error
    fail_with("Missing match completion field: #{missing_field(error)}.")
  end

  def missing_field(error)
    error.is_a?(ActionController::ParameterMissing) ? error.param : error.key
  end

  def fail_with(message)
    @error_message = message
    false
  end
end
