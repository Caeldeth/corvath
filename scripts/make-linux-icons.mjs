/**
 * Regenerates `build/icons/` — the Linux hicolor icon set — from the shared
 * macOS/Linux master in the document repo, `docs/logos/macros/Corvath_fixed.png`.
 *
 * Run by hand after the artwork changes, and COMMIT the output:
 *
 *   node scripts/make-linux-icons.mjs [path-to-source.png]
 *
 * `build/` is `directories.buildResources`, so nothing here is packaged into the
 * asar — electron-builder reads it at build time only. Committing the PNGs is
 * what keeps ImageMagick off CI, exactly as `build/icon-mac.png` already does.
 *
 * ## Why a directory of eight files rather than one PNG
 *
 * electron-builder resolves the Linux icon as `[linux.icon, mac.icon ?? icon]`
 * (`app-builder-lib/out/targets/LinuxTargetHelper.js`), so `mac.icon` OUTRANKS
 * the top-level `icon`. Corvath sets `mac.icon`, so this had to be explicit
 * whatever else changed.
 *
 * And a single PNG is never resampled (`iconConverter.js`, `doConvertIcon`):
 * one PNG in, one hicolor entry out, at whatever size that file happens to be.
 * `hicolor`'s `index.theme` enumerates sizes up to 512, so corvath's previous
 * `linux.icon: build/icon.png` produced exactly one `1254x1254` entry that no
 * desktop environment indexes — a blank generic document icon.
 *
 * Corvath was the one repo in R-008's sweep where `linux.icon` WAS set and the
 * row was still a defect. The key being present is not the invariant; the SET is.
 *
 * ## Which master, and why it is not `build/icon.png`
 *
 * Corvath carries two unrelated pieces of artwork, which is unusual among the
 * siblings and is the trap here:
 *
 *   build/icon.png              the raven + heptagram "argent" tile — WINDOWS ONLY
 *   Corvath_fixed.png (macros)  the line-art tarot card + quill — macOS AND LINUX
 *
 * They are different pictures, not variants: measured 19.5% RMSE with alpha
 * ignored. `build/icon-mac.png` is this master with Apple's squircle mask and
 * 824/1024 inset applied, which is why its ink box reads `824x824+100+100` while
 * the master reads full-bleed.
 *
 * **Generating from `build/icon.png` would pass every assertion in this file and
 * still ship the wrong picture.** That is taliesin's recorded trap (HTOO-38), and
 * corvath is the repo where it is easiest to fall into, because its Windows art
 * is the one most people picture when they think of this app. Pinned here, in
 * `electron-builder.yml`, and in `scripts/icons.test.mjs`, because a comment in
 * one place is not a defence.
 *
 * **Nothing is cropped, and that is the point.** The master is full-bleed, so
 * Apple's inset is something `build/icon-mac.png` ADDS rather than something
 * Linux has to undo. Balor reached the same arrangement after finding it had
 * added a 100px transparent margin in one command and removed it in the next; a
 * crop step that is never needed is a trap for whoever edits this next.
 *
 * The master lives in the sibling document repo. That is a dev-machine
 * dependency only: the eight PNGs are committed, so a build — and CI — never
 * reaches for it.
 *
 * ## Reading alpha correctly
 *
 * `%[channels]` does NOT answer "does this have transparency": it reports
 * `srgba` for a fully opaque PNG32, which is exactly what an image editor
 * produces when it flattens on export. `%@` on the image does not answer it
 * either — that is a TRIM box, which trims on any uniform border colour, so a
 * flattened copy trims identically to a correct one.
 *
 * `-alpha extract` is what separates them, and `%@` is only meaningful on ITS
 * output, where black means fully transparent and the trim box really is the
 * alpha bounding box. Both forms are used below, each on the right operand.
 *
 * **Levels, not just minima.** `_fixed` means the alpha was REPAIRED, not that
 * it was antialiased — dagda and mabon both found their `_fixed` master carried
 * a two-level (binary) alpha where an in-repo master had hundreds, and both
 * preferred the smoother source. Corvath has no smoother alternative: its only
 * other alpha-carrying file is `build/icon-mac.png`, which is inset and 1024
 * rather than 1254. The level count is therefore REPORTED at both ends rather
 * than used to choose, so the next reader sees what they are working with.
 *
 * ## The invariant is full-bleed, and it is checked on the OUTPUT
 *
 * The rule HTOO-38 protects is that every written size reaches the edge of its
 * canvas, so the icon draws at the same weight as its neighbours. An inset
 * source draws ~12% small at every size and passes a size check — the subtler
 * half of that defect. So this verifies what it wrote rather than its arguments.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * The shared macOS/Linux master in the document repo. Override with argv[2].
 *
 * NOT `build/icon.png` — that is the Windows artwork, and using it here ships a
 * plausible wrong icon that passes every check in this file.
 *
 * Note the capitalised filename. `docs/logos/macros/` is inconsistent about case
 * and follows nothing: balor, dagda, midir and taliesin are lowercase; Corvath,
 * Creidhne, Elatha, Epona, Mabon and Oghma are capitalised. Deriving this path
 * from `productName` or from the repo directory name misses on a case-sensitive
 * filesystem.
 */
const DEFAULT_SOURCE = resolve(repoRoot, '../Comhaigne/docs/logos/macros/Corvath_fixed.png')

/**
 * hicolor's standard set. `collectIconsFromDir` accepts `NxN.png` or `N.png`;
 * the `NxN` form matches the installed `hicolor/<size>/apps/` layout and is what
 * every sibling that has done this uses.
 */
const SIZES = [16, 24, 32, 48, 64, 128, 256, 512]

const magick = (args) => execFileSync('magick', args, { stdio: ['ignore', 'pipe', 'inherit'] })
const probe = (args) => magick(args).toString().trim()

/** Levels > 1 with a minimum of 0 means real transparency, not just a channel. */
function assertRealAlpha(file, label) {
  const [levels, minima] = probe([file, '-alpha', 'extract', '-format', '%k %[fx:minima]', 'info:'])
    .split(/\s+/)
    .map(Number)
  if (!(levels > 1 && minima === 0)) {
    throw new Error(
      `${label} has no real transparency (levels=${levels}, minima=${minima}). ` +
        'A flattened master passes a %[channels] check and still ships an icon ' +
        'sitting on a visible rectangle of its own background.'
    )
  }
  return levels
}

function main() {
  const source = resolve(process.argv[2] ?? DEFAULT_SOURCE)
  if (!existsSync(source)) {
    console.error(`Source artwork not found: ${source}`)
    console.error('It lives in the sibling document repo; the committed PNGs do not need it.')
    process.exit(1)
  }

  const size = probe([source, '-format', '%wx%h', 'info:'])
  const levels = assertRealAlpha(source, 'source')
  const bbox = probe([source, '-alpha', 'extract', '-format', '%@', 'info:'])
  console.log(`source ${source}`)
  console.log(`  ${size}, alpha levels ${levels}, alpha bbox ${bbox}`)

  const outDir = join(repoRoot, 'build', 'icons')

  // Generate into a temp directory and only move into place once all eight
  // verify. Writing straight to build/icons/ and checking afterwards leaves a
  // failed run's bad output on disk under the right filenames, where the next
  // `git add` commits it — worse than not checking, because the error scrolls
  // past and the files look generated. Taliesin's finding.
  const tmp = mkdtempSync(join(tmpdir(), 'corvath-linuxicons-'))
  const written = []
  try {
    for (const px of SIZES) {
      const out = join(tmp, `${px}x${px}.png`)
      // `!` forces the exact square. The master is square, so this is a
      // sub-pixel correction rather than a distortion.
      magick([source, '-filter', 'Lanczos', '-resize', `${px}x${px}!`, '-strip', `PNG32:${out}`])
      written.push([px, out])
    }

    const report = verifyAll(written)

    mkdirSync(outDir, { recursive: true })
    for (const [px, file] of written) {
      copyFileSync(file, join(outDir, `${px}x${px}.png`))
    }

    console.log(`\nwrote ${written.length} icons to ${outDir}`)
    console.log('verified full-bleed RGBA at every size:')
    for (const line of report) console.log(`  ${line}`)
    console.log('\nCommit build/icons/ — these ship instead of being generated in CI.')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** Verify what was written, not what was asked for. Throws on the first fault. */
function verifyAll(written) {
  const report = []
  for (const [px, file] of written) {
    const buf = readFileSync(file)
    if (buf.subarray(1, 4).toString() !== 'PNG') throw new Error(`${file} is not a PNG`)
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    if (width !== px || height !== px) {
      throw new Error(`${file} is ${width}x${height}, expected ${px}x${px}`)
    }
    // Colour type 6 is RGBA. An icon that lost its alpha renders on a visible
    // rectangle, which is the failure this whole file is about.
    if (buf[25] !== 6) throw new Error(`${file} has colour type ${buf[25]}, expected 6 (RGBA)`)

    const alphaBox = probe([file, '-alpha', 'extract', '-format', '%@', 'info:'])
    if (alphaBox !== `${px}x${px}+0+0`) {
      throw new Error(
        `${file} is not full-bleed: alpha bbox ${alphaBox}, expected ${px}x${px}+0+0. ` +
          'An inset icon draws small at every size and passes a size check.'
      )
    }
    // Reported, not asserted. The master's alpha is binary (2 levels); the
    // resize is what antialiases the edge, so this is the number that says
    // whether the small sizes actually came out smooth.
    const outLevels = Number(probe([file, '-alpha', 'extract', '-format', '%k', 'info:']))
    report.push(`${px}x${px}  ${String(buf.length).padStart(7)}B  alpha levels ${outLevels}`)
  }
  return report
}

main()
