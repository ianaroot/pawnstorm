# editorV2 rules

## Condition sentence structure — single source of truth

`NodePresenter::SENTENCE_SPEC` (Ruby) is the only definition of which
chunks a condition kind renders and which payload field feeds each.
Both render paths interpret it: `NodePresenter` server-side, and
`conditionPreviewFormatter.js` client-side via the served spec (the
`shared/_condition_sentence_spec` partial). Do not reintroduce per-kind
branching in the formatter.

- Adding or changing a chunk role touches a fixed set: `SENTENCE_SPEC`
  and `ROLE_KEYS` (NodePresenter), `formatConditionPreviewChunk` and
  `parseChunkDataset` (`conditionPreviewFormatter.js`), and the
  `_condition.html.erb` data-attrs. Miss one and the role silently
  half-works.
- `app/javascript/vitest.setup.js` holds a test-scoped mirror of
  `SENTENCE_SPEC`. Drift is silent — JS tests pass against stale
  structure while production uses the served spec. `node_presenter_spec`
  locks the Ruby side; keep the mirror in step.
- Wording lives only in the JS formatter (`subjectLabel`,
  `operatorLabel`, `positionAxisPreview`, …). Ruby chunks carry raw
  enum tokens, never display strings.
