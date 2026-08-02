// Build the Hybrasyl bundled art from the PNG originals.
//
// Reads the authoritative PNG originals from SRC, converts each to WebP with
// ImageMagick, and writes them into bundled/decks/hybrasyl/ renamed to the
// deterministic card-id filenames that seedDecks.ts generates (maj-<n>.webp,
// <suit>-<rank>.webp, back.webp).
//
// Idempotent and re-runnable: as cards are drawn, just re-run this. Missing
// source files are skipped (the deck ships partial and the renderer falls back
// to the name placeholder for undrawn cards).
//
// NOTE: the deck's art is a work in progress, so `hybrasyl` in seedDecks.ts has
// no `imageExt`/`back` yet — without those the seeded cards claim no image and
// this art is inert. When the set is complete (or complete enough to ship),
// add `imageExt: 'webp'` + `back: 'back.webp'` to the spec and bump its
// seedVersion.
//
// Naming: majors are matched by their pantheon name (case-insensitive), so
// `Deoch.png` -> maj-0.webp. Minors are `<Suit> - <Rank>.png`, where rank is
// either a word (Ace, Two … Eight) or a numeral 1-8, or a court rank
// (Mentor/Guide/Speaker/Dreamer). The card back is `Back - Cards.png`.
//
// Usage:  node scripts/build-hybrasyl-art.mjs
// Env override:  HYBRASYL_SRC=<dir>  MAGICK=<path to magick binary>

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = process.env.HYBRASYL_SRC ?? 'F:\\Downloads\\Tarot Images\\Hybrasyl Tarot'
const MAGICK = process.env.MAGICK ?? 'F:\\Applications\\ImageMagick-7.1.0-Q16-HDRI\\magick'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'bundled', 'decks', 'hybrasyl')

// Mirror the id conventions in src/main/seedDecks.ts. Keep these in step with
// the `hybrasyl` spec there — a rename on one side silently stops matching.
const PIPS = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
const COURT = ['mentor', 'guide', 'speaker', 'dreamer']
const SUITS = ['swords', 'staves', 'coins', 'cups']

// Majors in seed order — index is the `maj-<n>` number.
const MAJORS = [
  'Deoch',
  'Glioca',
  'Cail',
  'Luathas',
  'Gramail',
  'Fiosachd',
  'Ceannlaidir',
  'Sgrios',
  'Grannos',
  'Saothra',
  'Céithe',
  'Eolathe',
  'Marcan',
  'Lir',
  'Leothne',
  'Cairde',
  'Oraithe Ridire',
  'Neamhghlan',
  'Codlaim',
  'Dubh-Gabhar',
  'Duibheagan',
  'Fhala',
  'Adhnann',
  'Cin-Mhare',
  'Diorradh',
  'Bhàrnadh',
  'Bodhrag',
  'Cnortha',
  'Duairce',
  'Anaman',
  'Cairrthir',
  'Basnuall',
  'Chadul',
  'Danaan',
  'Grinneal'
]

// Compare loosely: accents and punctuation vary between filesystems and the
// source filenames aren't authored to match the seed exactly.
const norm = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

const majorIndex = new Map(MAJORS.map((name, i) => [norm(name), i]))

/** Map a source PNG basename (without extension) to its card-id, or null to skip. */
function targetId(base) {
  if (/^Back\s*-\s*Cards$/i.test(base)) return 'back'

  // `Arcana - 12 - Marcan` and a bare `Marcan` both resolve to maj-12.
  const numbered = base.match(/^Arcana\s*-\s*(\d+)\s*-\s*/i)
  if (numbered) {
    const n = parseInt(numbered[1], 10)
    return n >= 0 && n < MAJORS.length ? `maj-${n}` : null
  }

  const s = base.match(/^(\w+)\s*-\s*(.+)$/)
  if (s && SUITS.includes(norm(s[1]))) {
    const suit = norm(s[1])
    const rank = norm(s[2])
    const numeric = rank.match(/^0*(\d+)$/)
    if (numeric) {
      const idx = parseInt(numeric[1], 10) // 1..8
      return idx >= 1 && idx <= PIPS.length ? `${suit}-${PIPS[idx - 1]}` : null
    }
    if (PIPS.includes(rank) || COURT.includes(rank)) return `${suit}-${rank}`
    return null
  }

  const major = majorIndex.get(norm(base))
  return major === undefined ? null : `maj-${major}`
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
console.log(`Drawn: ${converted} of ${MAJORS.length + SUITS.length * 12 + 1} (incl. back)`)
if (skipped.length) console.log(`Skipped (unrecognized): ${skipped.join(', ')}`)
