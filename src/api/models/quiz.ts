export interface QuizOption {
    text: string
    optionFiles: string[]
}

export interface QuizCorrectAnswer {
    text: string
    order: number
}

export interface QuizQuestion {
    questionId: number
    questionText: string
    options: QuizOption[]
    correct: QuizCorrectAnswer
}

export interface QuizData {
    data: QuizQuestion[]
}
