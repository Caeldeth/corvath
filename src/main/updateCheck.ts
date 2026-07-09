/**
 * Lightweight update *notification* — no electron-updater, no auto-download.
 * On launch we ask GitHub for the latest published release and, if its tag is
 * newer than the running version, hand the renderer a version + release URL to
 * surface. Any failure (offline, rate-limited, no releases yet) is swallowed:
 * the check is best-effort and never blocks or crashes startup.
 */
import type { UpdateInfo } from '../shared/types'

const LATEST_RELEASE_URL = 'https://api.github.com/repos/Caeldeth/corvath/releases/latest'

/** Split a semver-ish tag into numeric components, ignoring a `v` prefix and any pre-release suffix. */
function parseVersion(v: string): number[] {
  return v
    .replace(/^v/i, '')
    .split('-')[0]
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

/** True when `remote` is a strictly higher version than `local`. */
export function isNewerVersion(local: string, remote: string): boolean {
  const a = parseVersion(local)
  const b = parseVersion(remote)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return false
}

interface GithubRelease {
  tag_name?: string
  html_url?: string
  draft?: boolean
  prerelease?: boolean
}

/** Resolve to update info when a newer stable release exists, else null. */
export async function checkForUpdate(currentVersion: string): Promise<UpdateInfo | null> {
  try {
    const res = await fetch(LATEST_RELEASE_URL, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'corvath' }
    })
    if (!res.ok) return null
    const data = (await res.json()) as GithubRelease
    if (!data.tag_name || data.draft || data.prerelease) return null
    if (!isNewerVersion(currentVersion, data.tag_name)) return null
    return { version: data.tag_name.replace(/^v/i, ''), url: data.html_url ?? '' }
  } catch {
    return null
  }
}
