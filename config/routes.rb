Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations', sessions: 'users/sessions' }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  
  root to: "matches/bot_vs_bot#new"

  get 'help/bots', to: 'help#bots', as: :bot_help

  resources :bots, except: :show do
    member do
      post :compile
      post :clone
    end
    resources :nodes, controller: 'bot_nodes', except: [:index, :new, :destroy] do
      member do
        post :connect
        post :update_position
      end
      collection do
        delete :batch_destroy
        post :batch_update_positions
      end
    end
    delete 'nodes/:node_id/connections/:id', to: 'bot_nodes#disconnect', as: :connection
  end

  if Rails.env.development? || Rails.env.test?
    get 'matches/sandbox', to: 'matches#sandbox', as: :match_sandbox
  end

  resources :tournaments, only: [:index, :new, :create], constraints: { id: /\d+/ } do
    resources :entries, only: [:create, :update, :destroy], controller: 'tournament_entries'
    member do
      post :start
      post :abort
      post :pause
      post :resume
    end
  end

  resources :public_tournaments, only: [:show], controller: 'tournaments' do
    member do
      get 'pairings/:entrant_a_id/:entrant_b_id', to: 'tournaments#pairing', as: :pairing
    end
  end

  get 'tournaments/:invite_token', to: 'tournaments#show_by_invite', as: :invitation_tournament
  get 'tournaments/:invite_token/pairings/:entrant_a_id/:entrant_b_id',
    to: 'tournaments#pairing_by_invite',
    as: :invitation_tournament_pairing
  post 'tournaments/:invite_token/entries', to: 'tournament_entries#create', as: :invitation_tournament_entries
  match 'tournaments/:invite_token/entries/:id',
    to: 'tournament_entries#update',
    via: :patch,
    as: :invitation_tournament_entry
  match 'tournaments/:invite_token/entries/:id',
    to: 'tournament_entries#destroy',
    via: :delete,
    as: nil

  get 'matches/bot-vs-bot/new', to: 'matches/bot_vs_bot#new', as: :new_bot_vs_bot_match
  post 'matches/bot-vs-bot', to: 'matches/bot_vs_bot#create', as: :bot_vs_bot_matches
  get 'matches/human-vs-bot/new', to: 'matches/human_vs_bot#new', as: :new_human_vs_bot_match
  post 'matches/human-vs-bot', to: 'matches/human_vs_bot#create', as: :human_vs_bot_matches
  get 'matches/human-vs-bot/:id/live', to: 'matches/human_vs_bot#live', as: :live_human_vs_bot_match
  patch 'matches/human-vs-bot/:id/live', to: 'matches/human_vs_bot#complete', as: :complete_human_vs_bot_match
  resources :matches, only: [:show]

  # Defines the root path route ("/")
  # root "posts#index"
end
