Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: 'users/registrations' }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  
  root to: "home#index" 

  get 'help/bots', to: 'help#bots', as: :bot_help

  resources :bots, except: :show do
    member do
      post :compile
    end
    resources :nodes, controller: 'bot_nodes', except: [:index, :new] do
      member do
        post :connect
        post :update_position
      end
      collection do
        post :batch_update_positions
      end
    end
    delete 'nodes/:node_id/connections/:id', to: 'bot_nodes#disconnect', as: :connection
  end

  if Rails.env.development? || Rails.env.test?
    get 'matches/sandbox', to: 'matches#sandbox', as: :match_sandbox
    resources :tournaments, only: [:new, :create, :show] do
      member do
        get 'pairings/:entrant_a_id/:entrant_b_id', to: 'tournaments#pairing', as: :pairing
        post :abort
        post :pause
        post :resume
      end
    end
  end

  resources :matches, only: [:new, :create, :show]

  # Defines the root path route ("/")
  # root "posts#index"
end
