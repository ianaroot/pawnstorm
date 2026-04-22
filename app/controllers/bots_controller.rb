class BotsController < ApplicationController
  before_action :authenticate_registered_or_guest_user!, except: [:index, :new, :create]
  before_action :set_bot, only: [:edit, :update, :destroy, :compile, :clone]

  def index
    @bots = current_user ? current_user.bots.order(:name) : Bot.none
  end

  def new
    @bot = Bot.new
  end

  def create
    @bot = current_user_or_create_guest!.bots.new(bot_params)
    if @bot.save
      redirect_to edit_bot_path(@bot), notice: 'Bot was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @nodes = @bot.nodes.includes(:outgoing_connections, :incoming_connections)
    @connections = @bot.nodes.flat_map(&:outgoing_connections)
    respond_to do |format|
      format.html
      format.json { render json: { nodes: @nodes, connections: @connections } }
    end
  end

  def update
    respond_to do |format|
      if @bot.update(bot_params)
        format.html { redirect_to edit_bot_path(@bot), notice: 'Bot was successfully updated.' }
        format.json do
          render json: {
            id: @bot.id,
            name: @bot.name,
            description: @bot.description,
            compiled_program_stale: @bot.compiled_program_stale
          }
        end
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: { errors: @bot.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def compile
    @bot.compile_program!
    respond_to do |format|
      format.html { redirect_to edit_bot_path(@bot), notice: 'Bot compiled. Reloading editor.' }
      format.json { render json: { success: true } }
    end
  rescue StandardError => error
    respond_to do |format|
      format.html { redirect_to edit_bot_path(@bot), alert: "Bot could not be compiled: #{error.message}" }
      format.json { render json: { success: false, error: error.message }, status: :unprocessable_entity }
    end
  end

  def clone
    cloner = BotCloner.new(@bot, current_user)
    new_bot = cloner.clone!
    redirect_to edit_bot_path(new_bot), notice: "Cloned as \"#{new_bot.name}\"."
  rescue StandardError => error
    redirect_to edit_bot_path(@bot), alert: "Clone failed: #{error.message}"
  end

  def destroy
    @bot.destroy
    redirect_to bots_path, notice: 'Bot was successfully destroyed.'
  end

  private

  def set_bot
    @bot = current_user.bots.find(params[:id])
  end

  def bot_params
    params.require(:bot).permit(:name, :description, :commands)
  end
end
