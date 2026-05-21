# app/models rules

## Invalidate compiled_program on non-ActiveRecord writes

The `Node`/`Connection` `after_commit` staleness hooks fire only for
ActiveRecord persistence. Any raw SQL / migration / `update_all` /
`update_column` / bulk write that touches node data or connections must
also set `compiled_program_stale = true` for the affected bots in the
same transaction. Over-marking only forces a recompile; under-marking
crashes every match.
