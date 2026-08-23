/**
 * The subset of GET/PATCH/POST-release's read-case response the Version
 * Editor reads or writes, factored out of use-edit-draft-version-form.ts
 * (task/version-editor/release-draft-version) so that hook's own file stays
 * under this project's own max-lines rule -- a mechanical extraction, no
 * behavior moved with it. Exported so a caller seeding this hook from a
 * just-created draft's own submitted content (task/version-editor/
 * new-draft-creation) can build one without re-declaring the shape, and so
 * the pre-Release checklist (services/release-checklist.ts) can read it
 * without importing the hook itself.
 */

import type { CaseVersionFormValues } from "./case-version-form-schema";

/**
 * The fields of read-case.dto.ts's own manifestEntrySchema this app's
 * readers of a whole version's manifest need (domain/knowledge/manifest-entry,
 * domain/knowledge/hypothesis-revision): the entry's own declared `position`,
 * its hypothesis's own stable identity (`hypothesis.name`), the referenced
 * revision's own `revision` number and `criterion`, and (task/version-editor/
 * release-draft-version, criterion 2) that same revision's own collected
 * concept names (`collects`). Widened from a `collects`-only projection
 * (task/version-editor/view-released-version-read-only, this app's own
 * inventory risk on this exact type) so the read-only render's own manifest
 * listing (criterion 6: position, hypothesis name, revision, criterion) can
 * read it from this one shared shape rather than a second, hand-declared
 * type -- `resolution` stays unread, matching use-manifest-builder.ts's own
 * independently declared, narrower-than-the-full-DTO projection for this
 * same endpoint (that hook needs neither `criterion` nor `collects`, so it
 * keeps its own smaller type rather than importing this wider one).
 */
export type CaseVersionManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: {
    readonly hypothesis: {
      readonly name: string;
    };
    readonly revision: number;
    readonly criterion: string;
    readonly collects: readonly string[];
  };
};

export type CaseVersionRecord = {
  readonly title: string;
  readonly when_to_use: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
  readonly consolidation_register?: CaseVersionFormValues["consolidation_register"];
  /**
   * domain/knowledge/case-version-state's own two values, exactly as GET
   * .../versions/{version} and POST .../release both report them
   * (read-case.dto.ts's own `state` field). Optional -- use-new-draft-
   * version-form.ts's own seed literal never carries it, since a freshly
   * created draft has never been read back through the real GET this record
   * otherwise always comes from.
   */
  readonly state?: "draft" | "released";
  /** Optional for the same reason as `state` above. */
  readonly manifest?: readonly CaseVersionManifestEntry[];
};
