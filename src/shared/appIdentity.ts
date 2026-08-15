// The single per-app identity constant for the house Report Issue module. This is
// the ONE file a sibling app edits to adopt the module; everything else in
// `shared/{scrub,osName,diagnostics,issueUrl}.ts` is drop-in.
//
// No electron/node imports, like every other file in `shared/` — main composes the
// issue URL from it and the renderer names the intake in its copy.
//
// **Corvath's own repository is not the intake, and that is the point.** A
// prefilled `issues/new` URL needs the reporter to have access to the target
// repo at all, and corvath is a personal repository. `hybrasyl/cernunnos` is
// public and is where every sibling app's reports already go; `appLabel` is what
// lets a maintainer triage by source app.

export interface AppIdentity {
  /** Shown in the diagnostics block, beside the version. */
  productName: string
  /** The public intake repository — the same one for every house app. */
  intakeOwner: string
  intakeRepo: string
  /**
   * Applied through the prefill URL's `labels=` parameter.
   *
   * **It must already exist on the intake repository.** GitHub applies a
   * `labels=` value only for a label that exists and drops it SILENTLY
   * otherwise, so a typo here costs a triage label with no error anywhere.
   * `app:corvath` was created on `hybrasyl/cernunnos` on 2026-08-06, ahead of
   * this adoption.
   */
  appLabel: string
}

/**
 * The house module doc's fifth field, `homepage`, is deliberately ABSENT.
 *
 * Balor dropped it after finding it consumed by nothing in five prior adoptions,
 * and its note says not to keep copying it forward. A value with no consumer has
 * never had to be right, so its first caller inherits a defect rather than a
 * feature. Add it when something needs it, with the right value at that moment.
 */
export const appIdentity: AppIdentity = {
  productName: 'Corvath',
  intakeOwner: 'hybrasyl',
  intakeRepo: 'cernunnos',
  appLabel: 'app:corvath'
}
