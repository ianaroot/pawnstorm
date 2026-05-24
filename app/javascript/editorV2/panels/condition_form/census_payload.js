// Census measurement payload (subject + operator + comparator + target),
// shared by CensusMode (which layers region keys on) and CapturesMode.
export function censusMeasurePayload({
  subject, subjectFilter, subjectFilterMode,
  operator, comparator,
  target, targetFilter, targetFilterMode, targetTotal
}) {
  const payload = {
    version: 2,
    kind: 'census',
    subject,
    subjectFilter,
    operator,
    comparator
  }
  if (subjectFilter !== 'any') {
    payload.subjectFilterMode = subjectFilterMode
  }
  payload.target = target
  if (target === 'exact_number') {
    payload.targetTotal = targetTotal
  } else if (target !== 'prior_board_state') {
    payload.targetFilter = targetFilter
    if (targetFilter !== 'any') {
      payload.targetFilterMode = targetFilterMode
    }
  }
  return payload
}
