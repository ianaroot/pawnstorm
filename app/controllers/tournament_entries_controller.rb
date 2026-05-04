class TournamentEntriesController < ApplicationController
  include BotEligibility
  before_action :authenticate_registered_user!
  before_action :set_tournament

  def create
    with_open_tournament_lock { create_entry }
  end

  def update
    with_open_tournament_lock do
      set_entry
      if entry.bot_owner == current_user
        update_entry
      else
        redirect_back_with_alert('You can only manage your own entries.')
      end
    end
  end

  def destroy
    with_open_tournament_lock do
      set_entry
      if entry.bot_owner == current_user
        entry.destroy!
        redirect_to tournament_return_path, notice: 'Entry withdrawn.'
      else
        redirect_back_with_alert('You can only manage your own entries.')
      end
    end
  end

  private

  attr_reader :tournament, :entry

  def create_entry
    bot = eligible_bot
    return redirect_back_with_alert('Choose a compiled bot that belongs to you.') unless bot
    return redirect_back_with_alert(msg) if (msg = constraint_violation_message(bot))

    if tournament.entries_per_user_one?
      entry = current_user_entry
      return redirect_back_with_alert('That bot is already entered in this tournament.') if bot_already_entered?(bot, excluding: entry)
      return redirect_back_with_alert('Tournament is full.') if entry.nil? && tournament_full?

      entry ||= tournament.tournament_entries.build(seed_order: next_seed_order)
      snapshot_entry(entry, bot)
      save_entry(entry)
    else
      return redirect_back_with_alert('That bot is already entered in this tournament.') if bot_already_entered?(bot)
      return redirect_back_with_alert('Tournament is full.') if tournament_full?

      save_entry(snapshot_entry(tournament.tournament_entries.build(seed_order: next_seed_order), bot))
    end
  end

  def update_entry
    bot = eligible_bot
    return redirect_back_with_alert('Choose a compiled bot that belongs to you.') unless bot
    return redirect_back_with_alert(msg) if (msg = constraint_violation_message(bot))
    return redirect_back_with_alert('That bot is already entered in this tournament.') if bot_already_entered?(bot, excluding: entry)

    save_entry(snapshot_entry(entry, bot))
  end

  def set_tournament
    @tournament = if params[:invite_token].present?
      Tournament.find_by!(invite_token: params[:invite_token])
    else
      Tournament.find(params[:tournament_id])
    end
    return if params[:invite_token].present? || tournament.visibility_public? || tournament.creator == current_user

    head :not_found
  end

  def set_entry
    @entry = tournament.tournament_entries.find(params[:id])
  end

  def with_open_tournament_lock
    ActiveRecord::Base.transaction do
      tournament.lock!
      if tournament.status_open?
        yield
      else
        redirect_back_with_alert('Entries are closed.')
      end
    end
  end

  def eligible_bot
    current_user.bots.find_by(id: entry_params[:bot_id]).tap do |bot|
      return nil unless bot&.compiled_program.present? && bot.compiled_program_stale == false
    end
  end

  def current_user_entry
    tournament.tournament_entries.find_by(bot_owner: current_user)
  end

  def tournament_full?
    tournament.max_entries.present? && tournament.tournament_entries.count >= tournament.max_entries
  end

  def bot_already_entered?(bot, excluding: nil)
    scope = tournament.tournament_entries.where(bot: bot)
    scope = scope.where.not(id: excluding.id) if excluding
    scope.exists?
  end

  def snapshot_entry(entry, bot)
    entry.assign_attributes(
      bot: bot,
      bot_owner: current_user,
      display_name: bot.name,
      compiled_program_snapshot: bot.compiled_program
    )
    entry
  end

  def save_entry(entry)
    if entry.save
      redirect_to tournament_return_path, notice: 'Entry submitted.'
    else
      redirect_back_with_alert(entry.errors.full_messages.to_sentence)
    end
  end

  def next_seed_order
    (tournament.tournament_entries.maximum(:seed_order) || -1) + 1
  end

  def tournament_return_path
    if params[:invite_token].present?
      invitation_tournament_path(tournament.invite_token)
    else
      public_tournament_path(tournament)
    end
  end

  def redirect_back_with_alert(message)
    redirect_to tournament_return_path, alert: message
  end

  def constraint_violation_message(bot)
    return nil unless tournament.constraints.present?
    result = check_bot_eligibility(bot, tournament.constraints)
    return nil if result[:eligible]
    "Bot is not eligible for this tournament: #{result[:violations].map { |v| v[:message] }.join(', ')}"
  end

  def entry_params
    params.fetch(:tournament_entry, {}).permit(:bot_id)
  end
end
