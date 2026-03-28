class MatchesController < ApplicationController
  before_action :authenticate_user!

  def new
    load_bot_options
    load_selected_bots
  end

  def create
    load_bot_options
    @selected_own_bot_id = match_params[:own_bot_id]
    @selected_opponent_bot_id = match_params[:opponent_bot_id]
    load_selected_bots

    own_bot = @selected_own_bot
    opponent_bot = @selected_opponent_bot

    if own_bot.nil? || opponent_bot.nil?
      flash.now[:alert] = 'Please choose valid bots for both sides.'
      render :new, status: :unprocessable_entity
      return
    end

    stale_owned_bots = stale_selected_bots(own_bot, opponent_bot)
    if stale_owned_bots.any?
      if compile_confirmation_requested?
        if compile_selected_bots(stale_owned_bots)
          own_bot.reload
          opponent_bot.reload
        else
          render :new, status: :unprocessable_entity
          return
        end
      else
        flash.now[:alert] = stale_compile_message(stale_owned_bots)
        render :new, status: :unprocessable_entity
        return
      end
    end

    white_bot, black_bot = [own_bot, opponent_bot].shuffle
    white_snapshot = compiled_program_snapshot_for(white_bot)
    black_snapshot = compiled_program_snapshot_for(black_bot)

    if white_snapshot.nil? || black_snapshot.nil?
      flash.now[:alert] = 'Both bots must have a compiled program before match generation.'
      render :new, status: :unprocessable_entity
      return
    end

    match = Match.create!(
      creator: current_user,
      white_player: white_bot,
      black_player: black_bot,
      white_compiled_program_snapshot: white_snapshot,
      black_compiled_program_snapshot: black_snapshot,
      status: :pending,
      result: nil,
      allowed_to_move: 'W',
      captured_pieces: [],
      movement_notation: [],
      previous_layouts: []
    )

    ComputeMatchJob.perform_later(match.id)

    redirect_to match_path(match), notice: 'Match created. Generation will begin soon.'
  end

  def show
    @match = Match.find(params[:id])
  end

  def sandbox
  end

  private

  def load_bot_options
    @own_bots = current_user.bots.order(:name)
    @opponent_bots = Bot
      .where(compiled_program_stale: false)
      .where.not(user_id: current_user.id)
      .order(:name)
    @all_opponent_bots = (@own_bots + @opponent_bots).uniq(&:id)
    @selected_own_bot_id ||= params[:own_bot_id] || nil
    @selected_opponent_bot_id ||= params[:opponent_bot_id] || nil
  end

  def selectable_opponent_bot_for(bot_id)
    return nil if bot_id.blank?

    @all_opponent_bots.find { |bot| bot.id == bot_id.to_i }
  end

  def stale_selected_bots(*bots)
    bots.compact.select { |bot| bot.user_id == current_user.id && bot.compiled_program_stale? }
  end

  def load_selected_bots
    @selected_own_bot = @own_bots.find { |bot| bot.id == @selected_own_bot_id.to_i } if @selected_own_bot_id.present?
    @selected_opponent_bot = selectable_opponent_bot_for(@selected_opponent_bot_id)
  end

  def compile_confirmation_requested?
    match_params[:stale_bot_confirmation] == 'compile'
  end

  def compile_selected_bots(bots)
    bots.each(&:compile_program!)
    true
  rescue StandardError => error
    flash.now[:alert] = "Selected stale bot#{'s' if bots.length != 1} could not be compiled: #{error.message}"
    false
  end

  def stale_compile_message(bots)
    names = bots.map(&:name).uniq.join(', ')
    return "#{names} needs to be recompiled before match generation." if bots.length == 1

    "#{names} each need to be recompiled before match generation."
  end

  def compiled_program_snapshot_for(bot)
    compiled_program = bot&.compiled_program
    return nil if compiled_program.blank?

    JSON.parse(compiled_program.to_json)
  end

  def match_params
    params.fetch(:match, {}).permit(:own_bot_id, :opponent_bot_id, :stale_bot_confirmation)
  end
end
