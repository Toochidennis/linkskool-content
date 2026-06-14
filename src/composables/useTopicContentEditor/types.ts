export type StudyBlockType =
  | 'text'
  | 'highlight'
  | 'list'
  | 'pairs'
  | 'examTip'
  | 'commonMistake'
  | 'equation'
  | 'workedExample'

export interface StudyBlock {
  id: number
  type: StudyBlockType
  title: string
  body?: string
  items?: string[] | Array<{ term: string; description: string }>
  /** For list blocks: render as a numbered (ordered) list instead of bullets. */
  ordered?: boolean
  wrong?: string
  correct?: string
}

export interface StudyQuizOption {
  text: string
}

export interface StudyQuizItem {
  id: number
  questionText: string
  options: StudyQuizOption[]
  correctAnswer: number
  explanation: string
  bloomLevel: string
}

export interface StudyMedia {
  type: 'image'
  url: string
  alt?: string
}

export interface StudySubsection {
  id: number
  title: string
  cards: StudyBlock[]
  media: StudyMedia[]
  diagramNeeded: boolean
}

export interface StudySection {
  id: number
  title: string
  subsections: StudySubsection[]
  quiz: StudyQuizItem[]
}

export interface FormattedStudyContent {
  media: {
    video?: {
      type: 'video'
      title: string
      url: string
      provider: string
      duration: string
      placement: string | null
    }
  }
  contents: StudySection[]
  finalQuiz: StudyQuizItem[]
}

export interface AiSummaryItem {
  op: 'add' | 'edit' | 'remove'
  target?: string
  label: string
  detail?: string
}

export interface AiMessage {
  id: number
  role: 'user' | 'assistant'
  body: string
  summary?: AiSummaryItem[]
  proposalId?: number
  status?: 'pending' | 'applied' | 'discarded'
}

/** A semantic authoring heading. `type` is the underlying card primitive (never shown to authors). */
export interface BlockPreset {
  label: string
  type: StudyBlockType | 'image'
  icon: string
  description: string
  /** Generic escape hatch — creates a card with an empty title. */
  noHeading?: boolean
  /** For list presets: scaffold a numbered list instead of bullets. */
  ordered?: boolean
}

export interface BlockPresetGroup {
  group: string
  presets: BlockPreset[]
}
