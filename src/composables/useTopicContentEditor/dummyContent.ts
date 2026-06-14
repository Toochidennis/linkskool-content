import type { FormattedStudyContent } from './types'

export const createDummyContent = (): FormattedStudyContent => ({
  media: {
    video: {
      type: 'video',
      title: 'Photosynthesis overview',
      url: 'https://example.com/photosynthesis-video',
      provider: 'youtube',
      duration: '6:42',
      placement: null,
    },
  },
  contents: [
    {
      id: 1,
      title: 'Introduction',
      subsections: [
        {
          id: 11,
          title: 'What Photosynthesis Is',
          diagramNeeded: false,
          media: [{ type: 'image', url: 'https://placehold.co/900x520?text=Leaf+diagram', alt: 'Leaf diagram' }],
          cards: [
            {
              id: 111,
              type: 'text',
              title: 'Definition',
              body: 'Photosynthesis is the process plants use to convert light energy into chemical energy stored as glucose.',
            },
            {
              id: 112,
              type: 'highlight',
              title: 'Key idea',
              body: 'Light energy is transformed into food energy.',
            },
            {
              id: 113,
              type: 'list',
              title: 'What plants need',
              items: ['Sunlight', 'Carbon dioxide', 'Water', 'Chlorophyll'],
            },
          ],
        },
        {
          id: 12,
          title: 'Why It Matters',
          diagramNeeded: true,
          media: [],
          cards: [
            {
              id: 121,
              type: 'examTip',
              title: 'Exam tip',
              body: 'Always mention glucose and oxygen when explaining the products of photosynthesis.',
            },
            {
              id: 122,
              type: 'commonMistake',
              title: 'Common mistake',
              wrong: 'Plants breathe in carbon dioxide and breathe out oxygen only at night.',
              correct: 'Plants take in carbon dioxide during photosynthesis and release oxygen as a product.',
            },
          ],
        },
      ],
      quiz: [
        {
          id: 701,
          questionText: 'What gas is released during photosynthesis?',
          options: [{ text: 'Nitrogen' }, { text: 'Oxygen' }, { text: 'Hydrogen' }, { text: 'Methane' }],
          correctAnswer: 1,
          explanation: 'Oxygen is released as water molecules are split during the light-dependent reactions.',
          bloomLevel: 'understand',
        },
      ],
    },
    {
      id: 2,
      title: 'The Process',
      subsections: [
        {
          id: 21,
          title: 'Light Dependent Stage',
          diagramNeeded: false,
          media: [],
          cards: [
            {
              id: 211,
              type: 'workedExample',
              title: 'Tracing the energy flow',
              body: 'Sunlight is absorbed by chlorophyll, water is split, oxygen is released, and energy carriers are formed.',
            },
            {
              id: 212,
              type: 'equation',
              title: 'Balanced equation',
              body: '$$6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2$$',
            },
          ],
        },
      ],
      quiz: [],
    },
  ],
  finalQuiz: [
    {
      id: 801,
      questionText: 'Which pigment traps light energy for photosynthesis?',
      options: [{ text: 'Haemoglobin' }, { text: 'Chlorophyll' }, { text: 'Melanin' }, { text: 'Keratin' }],
      correctAnswer: 1,
      explanation: 'Chlorophyll absorbs light energy in green plants.',
      bloomLevel: 'remember',
    },
  ],
})
