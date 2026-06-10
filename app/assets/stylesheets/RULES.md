# stylesheets rules

## Runtime-assembled selectors — searching for the name finds nothing

These selectors' full names are assembled at runtime, so searching for the
literal name finds nothing even though they're in use. Treat a "no matches"
result as *check here*, not *dead*.

- `pill--{success,warning,danger,info,muted,violet}` — suffix from
  `ApplicationHelper#pill_tint` (`app/helpers/application_helper.rb`),
  interpolated as `pill--<%= pill_tint(...) %>` in
  `app/views/bots/index.html.erb` and `app/views/matches/index.html.erb`.
- `status-option--{success,warning,danger,info,muted,violet}` — same
  `pill_tint`, as `status-option--#{pill_tint(...)}` in
  `app/views/tournaments/index.html.erb` and `app/views/bots/index.html.erb`.
- `match-replay-trace-pill--{pass,fail,score,skip,type}` — built in `pill()`
  in `app/javascript/gameplay/replay_trace_view.js` as
  `` `match-replay-trace-pill--${type}` ``.
- `ce-badge--{eligible,ineligible}` — built in `renderRow()` in
  `app/javascript/controllers/constraints_eligibility_controller.js` as
  `` `ce-badge--${result.eligible ? 'eligible' : 'ineligible'}` ``.
- `pagy-*` (e.g. `pagy-gap`) — emitted by the Pagy gem's `pagy_nav` helper,
  not written in this codebase.

## Maintaining this list

Add an entry whenever you introduce a class or id whose full name never
appears as a literal — string-interpolated (`"foo--#{x}"`), assembled in JS,
or emitted by a gem. A selector applied with its full literal name
(`classList.add("flipped")`, or `"x #{'x--active' if …}"`) can be found by
searching and does **not** belong here.

## Transparency uses channel tokens, not modern color functions

For a translucent variant of a token color, compose it from the matching
`--X-rgb` channel token: `rgba(var(--X-rgb), a)` (e.g.
`rgba(var(--error-rgb), 0.1)`). Don't reach for `color-mix()` or relative
color (`rgb(from …)`) — they are unsupported on the older browsers this app
still targets, where transparency must keep working.
