import type { Layout, LayoutPosition } from '../shared/types'

type SeedPosition = Omit<LayoutPosition, 'id'>

interface LayoutSpec {
  id: string
  name: string
  description: string
  positions: SeedPosition[]
}

const SPECS: LayoutSpec[] = [
  {
    id: 'single',
    name: 'Single Card',
    description: 'A single draw — a daily card or quick yes/no.',
    positions: [{ name: 'The Card', meaning: 'The heart of the matter.', x: 0.5, y: 0.5 }]
  },
  {
    id: 'three-card',
    name: 'Three Card',
    description: 'Past, present, and future.',
    positions: [
      { name: 'Past', meaning: 'Influences leading here.', x: 0.25, y: 0.5 },
      { name: 'Present', meaning: 'The current situation.', x: 0.5, y: 0.5 },
      { name: 'Future', meaning: 'Where things are heading.', x: 0.75, y: 0.5 }
    ]
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'The classic ten-card spread.',
    positions: [
      { name: 'The Present', meaning: 'The heart of the matter.', x: 0.3, y: 0.5 },
      { name: 'The Challenge', meaning: 'What crosses you.', x: 0.3, y: 0.5, rotation: 90 },
      { name: 'The Crown', meaning: 'Aim or ideal outcome.', x: 0.3, y: 0.22 },
      { name: 'The Foundation', meaning: 'Root of the situation.', x: 0.3, y: 0.78 },
      { name: 'The Past', meaning: 'Recent influences passing.', x: 0.13, y: 0.5 },
      { name: 'The Future', meaning: 'What is approaching.', x: 0.47, y: 0.5 },
      { name: 'The Self', meaning: 'Your role and attitude.', x: 0.72, y: 0.82 },
      { name: 'Environment', meaning: 'External influences.', x: 0.72, y: 0.6 },
      { name: 'Hopes & Fears', meaning: 'What you hope for or dread.', x: 0.72, y: 0.38 },
      { name: 'The Outcome', meaning: 'Where it all leads.', x: 0.72, y: 0.16 }
    ]
  },
  {
    id: 'horseshoe',
    name: 'Horseshoe',
    description: 'A seven-card arc from past to outcome.',
    positions: [
      { name: 'The Past', meaning: 'Past influences.', x: 0.1, y: 0.58 },
      { name: 'The Present', meaning: 'The current situation.', x: 0.21, y: 0.34 },
      { name: 'The Future', meaning: 'What lies ahead.', x: 0.34, y: 0.18 },
      { name: 'The Querent', meaning: 'You and your approach.', x: 0.5, y: 0.13 },
      { name: 'External Influences', meaning: 'Others and surroundings.', x: 0.66, y: 0.18 },
      { name: 'Obstacles & Advice', meaning: 'Hindrances and guidance.', x: 0.79, y: 0.34 },
      { name: 'The Outcome', meaning: 'The likely result.', x: 0.9, y: 0.58 }
    ]
  }
]

/** Build the built-in layouts. `now` is an ISO timestamp stamped on each. */
export function buildSeedLayouts(now: string): Layout[] {
  return SPECS.map((spec) => ({
    id: spec.id,
    name: spec.name,
    description: spec.description,
    builtIn: true,
    positions: spec.positions.map((pos, i) => ({ ...pos, id: `${spec.id}-${i}` })),
    createdAt: now,
    updatedAt: now
  }))
}
