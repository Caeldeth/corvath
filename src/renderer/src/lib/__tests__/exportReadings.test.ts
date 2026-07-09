import { describe, expect, it } from 'vitest'
import type { Layout, Reading } from '../../../../shared/types'
import { readingsToJson, toExportReadings } from '../exportReadings'
import { parseReadingsImport } from '../importReadings'

const threeCard: Layout = {
  id: 'lay-3',
  name: 'Three Card',
  positions: [
    { id: 'p1', name: 'Past', x: 0.2, y: 0.5 },
    { id: 'p2', name: 'Present', x: 0.5, y: 0.5 },
    { id: 'p3', name: 'Future', x: 0.8, y: 0.5 }
  ],
  createdAt: 'now',
  updatedAt: 'now'
}

const reading: Reading = {
  id: 'r1',
  title: 'Morning guidance',
  date: '2026-06-16',
  deck: 'Thoth',
  source: 'corvath',
  seed: 12345,
  drawMode: 'deal',
  layoutId: 'lay-3',
  layoutName: 'Three Card',
  notes: 'Overall narrative.',
  entries: [
    {
      id: 'e1',
      topic: 'Past',
      question: 'What shaped this?',
      card: 'The Star',
      orientation: 'upright',
      positionId: 'p1',
      notes: 'A turning point.'
    },
    { id: 'e2', topic: 'Present', question: '', card: 'Two of Cups', positionId: 'p2' },
    {
      id: 'e3',
      topic: 'Future',
      question: '',
      card: 'The Sun',
      orientation: 'reversed',
      positionId: 'p3'
    }
  ],
  createdAt: 'then',
  updatedAt: 'then'
}

describe('toExportReadings', () => {
  it('strips internal fields and omits empty optionals', () => {
    const [out] = toExportReadings([reading])
    expect(out).toEqual({
      title: 'Morning guidance',
      date: '2026-06-16',
      deck: 'Thoth',
      layout: 'Three Card',
      source: 'corvath',
      notes: 'Overall narrative.',
      entries: [
        {
          topic: 'Past',
          question: 'What shaped this?',
          card: 'The Star',
          orientation: 'upright',
          notes: 'A turning point.'
        },
        { topic: 'Present', card: 'Two of Cups' },
        { topic: 'Future', card: 'The Sun', orientation: 'reversed' }
      ]
    })
    // No ids, timestamps, seed, drawMode, layoutId, or positionId leak out.
    expect(JSON.stringify(out)).not.toMatch(/positionId|seed|drawMode|createdAt/)
  })

  it('round-trips back through the importer', () => {
    const json = readingsToJson([reading])
    const res = parseReadingsImport(json, [threeCard])
    expect(res.errors).toEqual([])
    expect(res.readings).toHaveLength(1)
    const r = res.readings[0]
    expect(r.title).toBe('Morning guidance')
    expect(r.date).toBe('2026-06-16')
    expect(r.deck).toBe('Thoth')
    expect(r.source).toBe('corvath')
    expect(r.notes).toBe('Overall narrative.')
    // Layout re-resolved by name; entries re-mapped to positions by order.
    expect(r.layoutId).toBe('lay-3')
    expect(r.entries.map((e) => e.card)).toEqual(['The Star', 'Two of Cups', 'The Sun'])
    expect(r.entries.map((e) => e.orientation)).toEqual(['upright', undefined, 'reversed'])
    expect(r.entries.map((e) => e.positionId)).toEqual(['p1', 'p2', 'p3'])
  })

  it('serializes an array for multiple readings', () => {
    const json = readingsToJson([reading, { ...reading, id: 'r2', title: 'Evening' }])
    const parsed = JSON.parse(json)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
  })
})
