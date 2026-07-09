import type { Orientation, Reading, ReadingSource } from '../../../shared/types'

/** A single card within an exported reading (import-shaped, no internal ids). */
export interface ExportEntry {
  topic?: string
  question?: string
  card: string
  orientation?: Orientation
  notes?: string
}

/**
 * A reading serialized to the exact shape `parseReadingsImport` accepts, so an
 * export round-trips back through Import. Internal fields (ids, timestamps,
 * seed/drawMode, positionId) are intentionally dropped — layout is referenced by
 * name and entries map to positions by order, matching the importer.
 */
export interface ExportReading {
  title: string
  date: string
  deck?: string
  layout?: string
  source?: ReadingSource
  notes?: string
  entries: ExportEntry[]
}

/** Map readings to the portable import shape, omitting empty optional fields. */
export function toExportReadings(readings: Reading[]): ExportReading[] {
  return readings.map((r) => {
    const out: ExportReading = {
      title: r.title,
      date: r.date,
      entries: r.entries.map((e) => {
        const entry: ExportEntry = { card: e.card ?? '' }
        if (e.topic) entry.topic = e.topic
        if (e.question) entry.question = e.question
        if (e.orientation) entry.orientation = e.orientation
        if (e.notes) entry.notes = e.notes
        return entry
      })
    }
    if (r.deck) out.deck = r.deck
    if (r.layoutName) out.layout = r.layoutName
    if (r.source) out.source = r.source
    if (r.notes) out.notes = r.notes
    return out
  })
}

/** Pretty-printed JSON for one or more readings, ready to write to a file. */
export function readingsToJson(readings: Reading[]): string {
  return JSON.stringify(toExportReadings(readings), null, 2)
}
