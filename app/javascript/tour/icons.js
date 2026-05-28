// SVG fragments used in the matches-show tour body strings. Returned as raw
// HTML; rendered via TourEngine's innerHTML for the tooltip body.

export const swatch = (cssVar) =>
  `<span aria-hidden="true" style="display:inline-block;width:14px;height:14px;vertical-align:middle;background:rgb(var(${cssVar}));border-radius:3px;margin:0 2px;"></span>`

export const passIcon = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style="vertical-align:middle;margin:0 2px;"><circle cx="8" cy="8" r="7" fill="#22c55e"/><path d="M4 8 L7 11 L12 5" fill="none" stroke="#062c14" stroke-width="2"/></svg>`

export const failIcon = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" style="vertical-align:middle;margin:0 2px;"><circle cx="8" cy="8" r="7" fill="#b57b7b"/><path d="M5 5 L11 11 M11 5 L5 11" stroke="#2c0606" stroke-width="2"/></svg>`

export const scoreIcon = `<svg aria-hidden="true" width="280" height="26" viewBox="0 0 280 26" style="display:block;margin:8px auto;"><rect width="280" height="26" rx="3" fill="rgba(251, 191, 36, 0.14)" stroke="rgba(251, 191, 36, 0.35)" stroke-width="1"/><rect width="3" height="26" fill="#fbbf24"/><rect x="12" y="6" width="50" height="14" rx="7" fill="#798596"/><text x="37" y="16" text-anchor="middle" font-size="8" fill="#192535" font-family="sans-serif" font-weight="600">applied</text><text x="70" y="17" font-size="11" fill="#fde68a" font-family="sans-serif">add 5</text><text x="270" y="17" text-anchor="end" font-size="10" fill="#fde68a" font-family="sans-serif">0 → 5</text></svg>`

export const organizerIcon = `<svg aria-hidden="true" width="64" height="14" viewBox="0 0 64 14" style="vertical-align:middle;margin:0 2px;"><rect width="64" height="14" rx="2" fill="#475569"/><text x="32" y="10" text-anchor="middle" fill="#cbd5e1" font-size="7" font-family="sans-serif">CHECKMATE</text></svg>`

export const arrowIcon = `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style="vertical-align:middle;margin:0 2px;"><path d="M4 4 L9 7 L4 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
