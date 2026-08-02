# Changelog

All notable user-facing changes to Corvath are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is
[Semantic Versioning](https://semver.org/).

<!--
Release process (the notes are authored HERE, not edited on GitHub after the fact):
  1. As you land a PR, add its user-facing change under ## [Unreleased]
     (Added / Changed / Fixed / Removed / Deprecated / Security).
  2. To cut a release: rename ## [Unreleased] to ## [X.Y.Z] - YYYY-MM-DD, add a
     fresh empty ## [Unreleased] above it, and bump package.json to X.Y.Z
     (npm version X.Y.Z --no-git-tag-version).
  3. Tag vX.Y.Z and push. The release workflow runs scripts/changelog-extract.mjs
     to pull THIS version's section into the GitHub release body, then appends the
     auto-generated PR list below it.
Keep entries user-facing — internal refactors/tests show up in the appended auto list.
-->

## [Unreleased]

First shipped release — a desktop tarot companion that draws readings, records
them, and lets you build the decks and spreads it draws from. All data is yours
and stays local.

### Added

- **Draw** — draw a reading in-app against any deck, either onto a saved spread
  or as a free run of N cards. Two modes: **deal from top**, which flips slot by
  slot and honours per-position top/bottom draw sources, and **fan & pick**,
  which fans the shuffled deck face-down for you to choose from. Every draw is
  seeded, so a recorded reading is reproducible.
- **Readings** — a journal of readings, each with a title, date, deck, optional
  spread, and free-form notes. Every card entry carries its own topic, question,
  orientation, the deck's meaning, and your interpretation. Readings drawn in-app
  are marked as such.
- **Decks** — a structure-agnostic deck builder: arbitrary majors, suits, pip
  ranks, and court ranks, with per-card meanings, keywords, and imported art plus
  a card back. Four decks ship built in — **Rider-Waite-Smith**, the **Argent
  Tarot** (original art on the Thoth structure), the **Empyrean** (original art,
  custom court ranks), and **Hybrasyl** (the Temuairan pantheon: 35 majors over
  four short suits).
- **Card meanings** — every built-in deck ships a meaning and keywords for each
  card, written in that deck's own register rather than one set of text reused
  across all four. Rider-Waite-Smith also carries reversed meanings. They are
  yours to edit.
- **Layouts** — a visual spread builder: drag positions on a board, name each
  slot, mark crossing cards, and set which end of the deck a slot draws from.
  Single Card, Three Card, Celtic Cross, and Horseshoe ship seeded. A recorded
  reading shows its spread with the drawn cards' art in place, and each card in
  the list below names the slot it fills.
- **Card preview** — click any face-up card to see it large, with its keywords,
  orientation, and the deck's meaning.
- **Import & export** — readings import and export as round-trippable JSON;
  decks export and import as portable `.corvathdeck` files (art included), so a
  deck you build can be shared.
- **Six themes** — four dark fantasy (Hybrasyl, Chadul, Danaan, Grinneal) plus
  the Mundanes (light) and Dubhaimid (dark) corporate pair; frameless custom
  title bar.
- **Update notification** — checks for a newer release on launch and offers a
  link. Nothing is downloaded or installed for you.
- **macOS and Linux builds** — alongside the Windows portable exe, releases now
  carry a macOS `.dmg` (universal, Apple Silicon and Intel) and Linux AppImage
  and `.deb` packages. These are **not yet signed or notarized**, so macOS
  Gatekeeper and Windows SmartScreen will warn on first run.
- **Branded startup on the portable build** — the portable exe unpacks itself
  before the app exists, which used to be several seconds of nothing. It now
  shows the Corvath splash for that whole stretch, so startup reads as one
  continuous boot.

### Changed

- **Smaller download and a faster splash.** The app no longer ships its UI
  libraries twice or decodes a 2.3 MB image to draw a 84-pixel logo. The
  packaged archive dropped from roughly 38,700 files to about 950, and the
  images inside it from 4.7 MB to 266 KB.

### Security

- **The window can no longer be navigated away from Corvath's own pages**, and
  links now reach your browser only when they are ordinary web or mail links.
  Anything else — a local file path, a network share, a script URL, or a custom
  scheme registered by some other program on your machine — is refused rather
  than handed to the operating system.
- **The interface runs sandboxed**, and every request it makes to the app's
  privileged side is checked to confirm it came from a real Corvath window
  showing Corvath's own content.
- **The shipped Electron runtime's debugging escape hatches are switched off**,
  so the bundled binary cannot be repurposed to run arbitrary code through
  environment variables or command-line flags.
