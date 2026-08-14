import { z } from 'zod'
import type { Deck, Layout, Reading, Settings } from '../../shared/types'

// Runtime schemas mirroring shared/types.ts. Used two ways:
//  - at every mutating IPC handler, to reject malformed renderer payloads
//    before anything touches disk (schema.parse throws → invoke rejects);
//  - inside the stores' `normalize`, so load-validation is a real parse rather
//    than a shallow cast (a corrupt field triggers backup/defaults recovery).
//
// Object schemas strip unknown keys by default, so forward-compatible extra
// fields are dropped rather than rejected; missing required fields or wrong
// types are what fail.

const THEME_NAMES = ['hybrasyl', 'danaan', 'chadul', 'grinneal', 'mundanes', 'dubhaimid'] as const

export const themeNameSchema = z.enum(THEME_NAMES)
export const orientationSchema = z.enum(['upright', 'reversed'])
const readingSourceSchema = z.enum(['manual', 'corvath'])
const drawModeSchema = z.enum(['deal', 'fan'])
const deckSourceSchema = z.enum(['top', 'bottom'])
const cardSectionSchema = z.enum(['major', 'minor'])

export const settingsSchema: z.ZodType<Settings> = z.object({
  theme: themeNameSchema
})

const entrySchema = z.object({
  id: z.string(),
  topic: z.string(),
  question: z.string(),
  positionId: z.string().optional(),
  card: z.string().optional(),
  orientation: orientationSchema.optional(),
  notes: z.string().optional()
})

export const readingSchema: z.ZodType<Reading> = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  deck: z.string(),
  source: readingSourceSchema.optional(),
  seed: z.number().optional(),
  drawMode: drawModeSchema.optional(),
  layoutId: z.string().optional(),
  layoutName: z.string().optional(),
  notes: z.string().optional(),
  entries: z.array(entrySchema),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const readingsSchema = z.array(readingSchema)

const layoutPositionSchema = z.object({
  id: z.string(),
  name: z.string(),
  meaning: z.string().optional(),
  x: z.number(),
  y: z.number(),
  rotation: z.number().optional(),
  source: deckSourceSchema.optional()
})

export const layoutSchema: z.ZodType<Layout> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  builtIn: z.boolean().optional(),
  positions: z.array(layoutPositionSchema),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const layoutsSchema = z.array(layoutSchema)

const deckCardSchema = z.object({
  id: z.string(),
  section: cardSectionSchema,
  name: z.string(),
  number: z.number().optional(),
  suit: z.string().optional(),
  rank: z.string().optional(),
  image: z.string().optional(),
  imageVersion: z.number().optional(),
  keywords: z.array(z.string()).optional(),
  meaning: z.string().optional(),
  meaningReversed: z.string().optional(),
  seedFingerprints: z.record(z.string(), z.string()).optional()
})

export const deckSchema: z.ZodType<Deck> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  builtIn: z.boolean().optional(),
  seedVersion: z.number().optional(),
  suits: z.array(z.string()),
  pipRanks: z.array(z.string()),
  courtRanks: z.array(z.string()),
  supportsReversed: z.boolean(),
  back: z.string().optional(),
  backVersion: z.number().optional(),
  cards: z.array(deckCardSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  seedFingerprints: z.record(z.string(), z.string()).optional()
})

export const decksSchema = z.array(deckSchema)

// Arguments to decks:saveImage. `data` arrives as a Uint8Array over IPC
// (structured clone). ext/deckId/cardId are further sanitized in the store.
export const saveImageArgsSchema = z.object({
  deckId: z.string(),
  cardId: z.string(),
  ext: z.string(),
  data: z.instanceof(Uint8Array)
})
