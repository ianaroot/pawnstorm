class BotsController < ApplicationController
  before_action :authenticate_registered_or_guest_user!, except: [:index, :new, :create]
  before_action :set_bot, only: [:edit, :update, :destroy, :compile]

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
    if @bot.update(bot_params)
      redirect_to edit_bot_path(@bot), notice: 'Bot was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def compile
    @bot.compile_program!
    redirect_to new_bot_vs_bot_match_path(own_bot_id: @bot.id), notice: 'Bot compiled. Exiting editor to match setup.'
  rescue StandardError => error
    redirect_to edit_bot_path(@bot), alert: "Bot could not be compiled: #{error.message}"
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
