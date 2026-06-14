/**
 * Strips rich-text HTML down to readable text (math nodes → their LaTeX) for
 * places that show rich content as plain text, e.g. outline/question stubs.
 */
export const plainText = (html: string): string => {
  if (!html) {
    return ''
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('[data-latex]').forEach(el => {
    el.textContent = el.getAttribute('data-latex') || ''
  })
  return (doc.body.textContent || '').trim()
}
