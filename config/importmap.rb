# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from 'app/javascript/gameplay', under: 'gameplay', to: 'gameplay'
pin_all_from 'app/javascript/bot_execution', under: 'bot_execution', to: 'bot_execution'
pin_all_from 'app/javascript/editorV2', under: 'editorV2', to: 'editorV2'
