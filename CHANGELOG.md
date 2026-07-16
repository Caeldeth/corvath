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
  custom court ranks), and **Hybrasyl**.
- **Layouts** — a visual spread builder: drag positions on a board, name each
  slot, mark crossing cards, and set which end of the deck a slot draws from.
  Single Card, Three Card, Celtic Cross, and Horseshoe ship seeded.
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
