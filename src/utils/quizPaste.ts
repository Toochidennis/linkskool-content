export interface ParsedQuestionPaste {
  question?: string
  options: string[]
  correctOptionIndex?: number
}

const optionPattern = /^([A-Ha-h]|\d+)[.)\]:-]\s+(.+)$/
const answerPattern = /^(answer|correct answer|correct)\s*[:\-]\s*(.+)$/i

const normalizeAnswerToken = (value: string) => value.trim().replace(/[.)\]:-]+$/, '').toLowerCase()

/**
 * Parses a pasted block of text into a question, its options, and (when stated)
 * the correct option. Handles "A) …", "1. …" option markers, a trailing "*" on
 * the correct option, and an explicit "Answer: …" line.
 */
export const parseQuestionPaste = (text: string): ParsedQuestionPaste => {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return { options: [] }
  }

  let answerToken = ''
  const contentLines = lines.filter(line => {
    const answerMatch = line.match(answerPattern)
    if (!answerMatch) return true
    answerToken = normalizeAnswerToken(answerMatch[2] ?? '')
    return false
  })

  const firstOptionIndex = contentLines.findIndex(line => optionPattern.test(line))
  const questionLines = firstOptionIndex >= 0 ? contentLines.slice(0, firstOptionIndex) : contentLines.slice(0, 1)
  const optionLines = firstOptionIndex >= 0 ? contentLines.slice(firstOptionIndex) : contentLines.slice(1)

  const options = optionLines.slice(0, 8).map(line => {
    const optionMatch = line.match(optionPattern)
    return (optionMatch?.[2] ?? line).replace(/\s+\*$/, '').trim()
  })

  const correctOptionIndex = optionLines.findIndex((line, index) => {
    const optionMatch = line.match(optionPattern)
    const optionLabel = normalizeAnswerToken(optionMatch?.[1] ?? String(index + 1))
    const optionText = normalizeAnswerToken(optionMatch?.[2] ?? line)
    return line.endsWith('*') || (!!answerToken && (answerToken === optionLabel || answerToken === optionText))
  })

  return {
    question: questionLines.join('\n'),
    options,
    correctOptionIndex: correctOptionIndex >= 0 ? correctOptionIndex : undefined,
  }
}

/**
 * Converts plain-text math/chemistry notation to a LaTeX-delimited string.
 *  - `H2` → `$H_{2}$` (uppercase + digits = subscript)
 *  - `a2` → `$a^{2}$` (lowercase + digits = superscript)
 *  - `x^2` → `$x^{2}$`, `sqrt(x)` → `$\sqrt{x}$`
 *  - arrows / relational operators → LaTeX equivalents
 * Returns the original text when nothing was converted.
 */
export const smartConvert = (text: string): string => {
  if (/\$|\\\(|\\\[/.test(text)) return text

  let result = text
  result = result.replace(/<=>/g, ' \\rightleftharpoons ')
  result = result.replace(/<->/g, ' \\leftrightarrow ')
  result = result.replace(/->/g, ' \\rightarrow ')
  result = result.replace(/<-/g, ' \\leftarrow ')
  result = result.replace(/(?<!<)>=/g, ' \\geq ')
  result = result.replace(/(?<!>)<=/g, ' \\leq ')
  result = result.replace(/!=/g, ' \\neq ')
  result = result.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
  result = result.replace(/\^(\d+)/g, '^{$1}')
  result = result.replace(/([A-Z])(\d+)/g, '$1_{$2}')
  result = result.replace(/([a-z])(\d+)/g, '$1^{$2}')

  if (result !== text) {
    result = `$${result.trim()}$`
  }
  return result
}

export const canAutoConvert = (text: string): boolean => {
  if (!text.trim()) return false
  if (/\$|\\\(|\\\[/.test(text)) return false
  return /([A-Za-z]\d)|(\^)|sqrt\(|->|<->|<=>|!=|>=|<=/.test(text)
}
