/**
 * The Discard confirmation Dialog's own state shape and pure logic
 * (task/version-editor/discard-draft-version), factored out of
 * use-edit-draft-version-form.ts so that hook's own file stays under this
 * project's own max-lines rule (ESLint's own `max-lines`, 300 --
 * eslint.config.js) -- the same mechanical extraction task/version-editor/
 * release-draft-version's own delivery already made for
 * services/release-checklist.ts and services/case-version-record.ts.
 *
 * This task's own logic is thinner than release's own checklist (no
 * capability-shaped computation, no violations array to parse into rows), so
 * the two named builders below (`buildDiscardMutationOptions`,
 * `buildDiscardControlState`) also carry the isolated mutation's own options
 * object and the "ready"-phase return field's own object literal -- both of
 * which release-draft-version's own delivery left inline in the hook, since
 * its own extracted checklist/violations logic already closed that task's
 * own gap to the limit on its own. Disclosed as this task's own inference in
 * its delivery record: a departure in extraction *shape* from that
 * precedent, made to satisfy the same MNT-01/ESLint constraint that
 * precedent answered a different way, not a departure from any behavior
 * either task's own criteria state. Neither builder performs the DELETE
 * itself out of turn or reacts to its outcome on the hook's behalf: the
 * caller-supplied `onDiscarded`/`onFailed` callbacks (and the returned
 * `onConfirm`/`onOpenChange`/`onSlugConfirmationChange` closures) still run
 * exactly where the hook's own telemetry, query cache and navigation live,
 * since none of those three reach a plain services module. `dialogOpen`,
 * `slugConfirmation` and `errorMessage` below take the hook's own raw
 * `useState` tuples directly (`[value, setter]`, the same shape `useState`
 * itself returns) rather than three separately named value/setter pairs, so
 * the hook's own call site stays small enough to leave this file's own
 * addition comfortably under the limit too.
 */

import type { UseMutationOptions } from "@tanstack/react-query";
import { apiFetch, ApiError } from "./api-client";

/** Everything a "ready"-phase caller needs to render the Discard control and its Dialog (task/version-editor/discard-draft-version). */
export type DiscardControlState = {
  readonly version: number;
  /** True only while the loaded version's own state is draft (criterion 1; rules/knowledge/only-a-draft-case-version-may-be-discarded). */
  readonly canDiscard: boolean;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** The confirmation field's own current value (criterion 3). */
  readonly slugConfirmation: string;
  readonly onSlugConfirmationChange: (value: string) => void;
  /** True only once `slugConfirmation` matches the case's own slug exactly (criterion 3). */
  readonly isConfirmEnabled: boolean;
  /** A failed DELETE's own message (criterion 6), or null while none has failed since the Dialog was last opened. */
  readonly errorMessage: string | null;
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
};

/**
 * Criterion 3's own barrier: the confirmation field must hold the case's own
 * slug exactly -- an exact string match, never a case-insensitive or
 * trimmed one, since the scope's own finding #4 states the server neither
 * validates nor expects an echoed slug at all, so nothing about this
 * comparison answers to a second, looser authority.
 */
export function isSlugConfirmed(typedSlug: string, slug: string): boolean {
  return typedSlug === slug;
}

/**
 * Criterion 6: "rendering that error's own message" -- the backend's own
 * ApiError.message (api-client.ts's own envelope, `error.message` verbatim),
 * never a fixed per-class wording this module would have to invent for
 * either of the two error classes the scope's own finding #4 names (404
 * CaseNotFoundError, 409 CaseVersionNotDraftError) -- the same "never invent
 * a label the backend did not return" reasoning release-checklist.ts's own
 * extractReleaseViolations already applies to a 422's own violations array.
 * A non-ApiError failure (a network drop that never reached api-client.ts's
 * own typed wrapping, API-03) falls back to `fallbackMessage` instead, since
 * there is no backend message to render at all.
 */
export function discardErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof ApiError ? error.message : fallbackMessage;
}

const GENERIC_DISCARD_FAILURE_MESSAGE = "Something went wrong while discarding this draft. Try again.";

/**
 * The isolated DELETE's own options object (contracts/knowledge/
 * case-lifecycle's own discard operation): no body (scope's own finding #4),
 * a 204 reaching `onDiscarded` with the discarded version number (so the
 * hook's own closure needs no extra `version !== null` narrowing of its own
 * -- `mutationFn`'s own guard below already proved it before resolving),
 * and every other response -- 404, 409, or anything else -- reaching
 * `onFailed` with that response's own message (criterion 6 draws no
 * distinction between them). The `version === null` guard mirrors
 * patchMutation's and releaseMutation's own guard in
 * use-edit-draft-version-form.ts: the Discard control is only ever exposed
 * once the "ready" phase is reached, which never happens while `version` is
 * still null.
 */
export function buildDiscardMutationOptions(params: {
  readonly slug: string;
  readonly version: number | null;
  readonly onDiscarded: (version: number) => void;
  readonly onFailed: (message: string) => void;
}): UseMutationOptions<number, unknown, void> {
  const { slug, version, onDiscarded, onFailed } = params;
  return {
    mutationFn: async () => {
      if (version === null) {
        throw new Error("cannot discard a draft version that has not been created yet");
      }
      await apiFetch<void>(`/v1/cases/${encodeURIComponent(slug)}/versions/${version}`, {
        method: "DELETE",
      });
      return version;
    },
    onSuccess: onDiscarded,
    onError: (error) => onFailed(discardErrorMessage(error, GENERIC_DISCARD_FAILURE_MESSAGE)),
  };
}

/**
 * Assembles the "ready"-phase `discard` field itself (criteria 1 through 7)
 * from the hook's own primitive state and setters -- a pure transformation,
 * so the hook's own return statement stays one call rather than a second,
 * inline object literal the size of `release`'s own in that same file.
 * `onOpenChange` always resets the typed confirmation and any previous
 * error, on either transition, matching `release`'s own "the next open
 * always starts fresh" convention (there stated only for a close, since a
 * checklist re-read only needs to happen on open there; here nothing needs
 * to run on open, so resetting unconditionally on either transition costs
 * nothing extra and needs no `if`).
 */
export function buildDiscardControlState(params: {
  readonly version: number;
  readonly slug: string;
  readonly canDiscard: boolean;
  readonly dialogOpen: readonly [boolean, (open: boolean) => void];
  readonly slugConfirmation: readonly [string, (value: string) => void];
  readonly errorMessage: readonly [string | null, (message: string | null) => void];
  readonly isConfirming: boolean;
  readonly onConfirm: () => void;
}): DiscardControlState {
  const { version, canDiscard, slug, isConfirming, onConfirm } = params;
  const [isOpen, setIsOpen] = params.dialogOpen;
  const [slugConfirmation, setSlugConfirmation] = params.slugConfirmation;
  const [errorMessage, setErrorMessage] = params.errorMessage;
  return {
    version,
    canDiscard,
    isOpen,
    onOpenChange: (open: boolean) => {
      setIsOpen(open);
      setSlugConfirmation("");
      setErrorMessage(null);
    },
    slugConfirmation,
    onSlugConfirmationChange: setSlugConfirmation,
    isConfirmEnabled: isSlugConfirmed(slugConfirmation, slug),
    errorMessage,
    isConfirming,
    onConfirm,
  };
}
