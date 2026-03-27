function updateMatchBotListScrollbar(frameElement) {
  const listElement = frameElement.querySelector('.match-bot-list')
  const trackElement = frameElement.querySelector('.match-bot-scroll-track')
  const thumbElement = frameElement.querySelector('.match-bot-scroll-thumb')
  if (!listElement || !trackElement || !thumbElement) { return }

  const clientHeight = listElement.clientHeight
  const scrollHeight = listElement.scrollHeight
  const trackHeight = trackElement.clientHeight
  const maxScrollTop = scrollHeight - clientHeight

  if (scrollHeight <= clientHeight || maxScrollTop <= 0) {
    thumbElement.style.height = '0px'
    thumbElement.style.transform = 'translateY(0)'
    return
  }

  const thumbHeight = Math.max(24, (clientHeight / scrollHeight) * trackHeight)
  const maxOffset = trackHeight - thumbHeight
  const thumbOffset = (listElement.scrollTop / maxScrollTop) * maxOffset

  thumbElement.style.height = `${thumbHeight}px`
  thumbElement.style.transform = `translateY(${thumbOffset}px)`
}

function initializeMatchBotListScrollbar(frameElement) {
  const listElement = frameElement.querySelector('.match-bot-list')
  if (!listElement) { return }

  updateMatchBotListScrollbar(frameElement)
  listElement.addEventListener('scroll', () => updateMatchBotListScrollbar(frameElement))
}

export function initializeMatchBotListScrollbars() {
  document.querySelectorAll('.match-bot-list-frame').forEach(initializeMatchBotListScrollbar)
}

export function refreshMatchBotListScrollbars() {
  document.querySelectorAll('.match-bot-list-frame').forEach(updateMatchBotListScrollbar)
}
