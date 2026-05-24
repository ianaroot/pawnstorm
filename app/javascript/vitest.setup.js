import { beforeEach } from 'vitest'

// Test-scoped mirror of NodePresenter::SENTENCE_SPEC. In production the spec is
// served by the shared/_condition_sentence_spec partial; tests inject it so the
// real DOM-read path in conditionPreviewFormatter runs (B: no production
// fallback). Keep in sync with NodePresenter::SENTENCE_SPEC — node_presenter_spec
// independently locks the Ruby side; the chunk roles/fields are the contract.
const SENTENCE_SPEC = {
  relational: [
    { role: 'side', fields: {
      subject: 'subject', filter: 'subjectFilter', filter_mode: 'subjectFilterMode',
      comparison_metric: 'subjectComparisonMetric', comparator: 'subjectComparator',
      comparison_source: 'subjectComparisonSource', comparison_source_total: 'subjectComparisonSourceTotal' } },
    { role: 'operator', fields: { operator: 'operator' } },
    { role: 'side', fields: {
      subject: 'target', filter: 'targetFilter', filter_mode: 'targetFilterMode',
      comparison_metric: 'targetComparisonMetric', comparator: 'targetComparator',
      comparison_source: 'targetComparisonSource', comparison_source_total: 'targetComparisonSourceTotal' } }
  ],
  identity: [
    { role: 'side', fields: { subject: 'subject', filter: 'subjectFilter', filter_mode: 'subjectFilterMode' } },
    { role: 'operator', consts: { operator: 'same_piece' } },
    { role: 'side', fields: { subject: 'target' } }
  ],
  census: {
    variant_by: 'position_axis_present',
    whole: [
      { role: 'side', fields: { subject: 'subject', filter: 'subjectFilter', filter_mode: 'subjectFilterMode' } },
      { role: 'operator', fields: { operator: 'operator' } },
      { role: 'comparison', fields: {
        comparator: 'comparator', target: 'target', target_filter: 'targetFilter',
        target_filter_mode: 'targetFilterMode', target_total: 'targetTotal' } }
    ],
    region: [
      { role: 'side', fields: { subject: 'subject', filter: 'subjectFilter', filter_mode: 'subjectFilterMode' } },
      { role: 'region', fields: {
        position_axis: 'positionAxis', position_comparator: 'positionComparator',
        position_target: 'positionTarget' } },
      { role: 'metric', fields: { operator: 'operator', comparator: 'comparator', target: 'target', target_total: 'targetTotal' } }
    ]
  }
}

beforeEach(() => {
  let element = document.getElementById('condition-sentence-spec')
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/json'
    element.id = 'condition-sentence-spec'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(SENTENCE_SPEC)
})
