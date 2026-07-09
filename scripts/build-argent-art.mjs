// Build the Argent Tarot bundled art from the PNG originals.
//
// Reads the authoritative PNG originals from SRC (ignoring any Temp/ folder),
// converts each to WebP with ImageMagick, and writes them into
// bundled/decks/argent/ renamed to the deterministic card-id filenames that
// seedDecks.ts generates (maj-<n>.webp, <suit>-<rank>.webp, back.webp).
//
// Idempotent and re-runnable: as the remaining suits' PNGs appear later, just
// re-run this. Missing source files are skipped (the deck ships partial and the
// renderer falls back to the name placeholder for undrawn cards).
//
// Usage:  node scripts/build-argent-art.mjs
// Env override:  ARGENT_SRC=<dir>  MAGICK=<path to magick binary>

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = process.env.ARGENT_SRC ?? 'F:\\Downloads\\Tarot Images\\Argent Tarot'
const MAGICK = process.env.MAGICK ?? 'F:\\Applications\\ImageMagick-7.1.0-Q16-HDRI\\magick'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'bundled', 'decks', 'argent')

// Mirror the id conventions in src/main/seedDecks.ts.
const PIPS = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const COURT = { knight: 'knight', queen: 'queen', prince: 'prince', princess: 'princess' }
const SUITS = { wands: 'wands', cups: 'cups', swords: 'swords', disks: 'disks' }

/** Map a source PNG basename (without extension) to its card-id, or null to skip. */
function targetId(base) {
  const m = base.match(/^Arcana\s*-\s*(\d+)\s*-\s*/i)
  if (m) return `maj-${parseInt(m[1], 10)}`

  if (/^Back\s*-\s*Cards$/i.test(base)) return 'back'

  const s = base.match(/^(Wands|Cups|Swords|Disks)\s*-\s*(.+)$/i)
  if (s) {
    const suit = SUITS[s[1].toLowerCase()]
    const rank = s[2].trim().toLowerCase()
    const numeric = rank.match(/^0*(\d+)$/)
    if (numeric) {
      const idx = parseInt(numeric[1], 10) // 1..10
      if (idx >= 1 && idx <= 10) return `${suit}-${PIPS[idx - 1]}`
      return null
    }
    if (COURT[rank]) return `${suit}-${COURT[rank]}`
    return null
  }
  return null
}

if (!existsSync(SRC)) {
  console.error(`Source art directory not found: ${SRC}`)
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

const pngs = readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.png'))
let converted = 0
const skipped = []

for (const file of pngs) {
  const base = file.replace(/\.png$/i, '')
  const id = targetId(base)
  if (!id) {
    skipped.push(file)
    continue
  }
  const src = join(SRC, file)
  const dst = join(OUT, `${id}.webp`)
  execFileSync(MAGICK, [src, '-quality', '90', dst], { stdio: 'inherit' })
  console.log(`  ${file}  ->  ${id}.webp`)
  converted++
}

console.log(`\nConverted ${converted} file(s) into ${OUT}`)
if (skipped.length) console.log(`Skipped (unrecognized): ${skipped.join(', ')}`)
