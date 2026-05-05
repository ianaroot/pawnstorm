# nodes

Security boundary for node data entering and leaving the Rails API. All untrusted input passes through here before touching the database.

---

## `data_validator.rb`

Validates the `data` hash on a node before save. Rejects anything structurally or semantically wrong with a descriptive error message.

Top-level checks (shared across node kinds):
- Requires a `version` key; dispatches on it (currently only `version: 2` is handled).
- For condition nodes, dispatches further on `kind`: `unary`, `relational`, or `position`.

Per-kind checks follow the same pattern:
1. **Key audit** — exact set of allowed keys is declared as a constant (`CONDITION_V2_UNARY_KEYS`, etc.); extra or missing keys are rejected.
2. **Field-level validation** — each key is checked against a whitelist of valid values (actors, filters, filter modes, operators, comparators, axes).
3. **Cross-field validation** — constraints that span multiple fields, e.g. `square` axis requires `positionComparator == 'equal_to'`; `filterMode` is only meaningful when `filter != 'any'`.
4. **Range checks** — numeric fields validated against allowed ranges (rank/file: 1–8; square: 0–63; `targetTotal` must be Numeric).

Private predicate helpers (`valid_filter?`, `valid_comparator?`, `valid_position_subject?`, etc.) are shared across kind-specific validation methods.

### `data_normalizer.rb`

Strips and coerces node data into canonical form after validation, before save. Makes downstream code safe to assume only relevant keys are present.

For condition nodes, dispatches on `kind` and removes keys that belong to other kinds:
- **`unary`** — removes relational and position keys (`target`, `targetFilter`, `positionAxis`, etc.).
- **`relational`** — removes unary-only and position keys.
- **`position`** — removes relational comparison keys and unary target keys; also normalizes `positionComparator` to `'equal_to'` when `positionAxis == 'square'`.

The normalizer assumes the validator has already run — it does not re-validate, it only cleans.
