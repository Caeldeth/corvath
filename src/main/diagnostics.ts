import os from 'os'
import { appIdentity } from '../shared/appIdentity'
import { simplifyPlatform } from '../shared/osName'
import { buildDiagnosticsBlock } from '../shared/diagnostics'
import { truncateBodyForUrl } from '../shared/issueUrl'
import { scrubText } from '../shared/scrub'
import { isSafeExternalUrl } from '../shared/externalUrl'
import { getRecentErrors } from './sessionLog'
import type { OpenIssueResult } from '../shared/types'

/**
 * Backing logic for the `diagnostics:*` handlers: shared helpers composed against
 * this session's captured errors.
 *
 * **It imports no electron, and the clipboard and the browser are injected.** That
 * is the same rule `pickDirectory`, `emitToRenderer` and `revealSettings` follow,
 * and it is what lets `handlers.ts` import this module at all — a runtime electron
 * import anywhere in that graph and the node vitest project stops loading it. The
 * payoff here is larger than usual: with the two side effects as arguments, every
 * assertion in `diagnostics.test.ts` — that the clipboard gets the FULL body, that
 * it gets it BEFORE the URL opens, that a refused URL still leaves a copy — is a
 * plain function call rather than an electron stub.
 */
export interface DiagnosticsIo {
  /** `clipboard.writeText`. */
  writeClipboard: (text: string) => void
  /** `shell.openExternal`, already gated on `isSafeExternalUrl` by its caller. */
  openExternal: (url: string) => void
}

/**
 * The URL length Corvath will hand to the OS.
 *
 * `shell.openExternal` is reliable to roughly 2 KB across the browsers and desktop
 * handlers this has to work on, and the limit is not one number: it is the smallest
 * of the browser's, the desktop portal's and, on Windows, the shell's. 1800 leaves
 * headroom rather than sitting on the estimate — and the cost of being conservative
 * is a truncation note on a report whose full text is already on the clipboard,
 * while the cost of being wrong is a button that does nothing.
 */
export const MAX_URL_LEN = 1800

/**
 * The scrubbed diagnostics block, shown EDITABLE in the report dialog.
 *
 * Editable is the point rather than a courtesy: scrubbing is a set of rules about
 * shapes, and the person sending the report is the only one who can see what the
 * rules missed. Showing them the exact text that will be sent is the part of this
 * feature that makes the rest of it honest.
 *
 * The entries are already scrubbed — `captureError` did it before the ring buffer —
 * so the pass here is idempotent insurance over the assembled block, which is also
 * where `productName` and the OS family join text that came from an error message.
 */
export function buildDiagnostics(version: string): string {
  const block = buildDiagnosticsBlock({
    productName: appIdentity.productName,
    version,
    os: simplifyPlatform(process.platform),
    errors: getRecentErrors()
  })
  let userName: string | undefined
  try {
    userName = os.userInfo().username
  } catch {
    userName = undefined
  }
  return scrubText(block, { homeDir: os.homedir(), userName })
}

/**
 * Open a prefilled issue on the shared public intake, after copying the full report.
 *
 * **The clipboard write is first and is unconditional**, which is what makes every
 * failure below survivable: a truncated URL is completed by paste, and a URL that is
 * refused outright still leaves the user holding the whole report to paste wherever
 * they like. It is also why the copy is not skipped when nothing was truncated —
 * the user has no way to know in advance which case they are in.
 *
 * Only the stable per-app label rides in the URL. GitHub applies a `labels=` value
 * only for a label that already exists and drops it silently otherwise, so a
 * per-version label would be a no-op nobody would notice; the version is in the
 * body instead, where nothing can drop it.
 */
export function openIssue(io: DiagnosticsIo, p: { title: string; body: string }): OpenIssueResult {
  io.writeClipboard(p.body)

  const { url, truncated } = truncateBodyForUrl(
    {
      owner: appIdentity.intakeOwner,
      repo: appIdentity.intakeRepo,
      title: p.title,
      body: p.body,
      labels: [appIdentity.appLabel]
    },
    MAX_URL_LEN
  )

  // Main composed this URL from its own constants, so the check can only fail if
  // `appIdentity` is edited into something that is not a web address. It runs
  // anyway: `shell.openExternal` hands a string to the operating system, and
  // `externalUrl.ts` exists precisely so no caller is trusted to have checked.
  // Refusing is reported rather than swallowed — the copy already happened, so
  // there is a real next step to offer.
  if (!isSafeExternalUrl(url)) return { ok: false, reason: 'unsafe-url' }

  io.openExternal(url)
  return { ok: true, truncated }
}

/**
 * The always-works fallback: the full report on the clipboard and nothing else.
 *
 * It exists for the user with no GitHub account, the machine with no browser
 * handler, and the report that is going into a chat window instead. No truncation
 * applies — the clipboard has no budget.
 */
export function copyReport(io: DiagnosticsIo, p: { body: string }): { ok: true } {
  io.writeClipboard(p.body)
  return { ok: true }
}
