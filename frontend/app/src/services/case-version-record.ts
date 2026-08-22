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
 * The one field of read-case.dto.ts's own manifestEntrySchema the pre-Release
 * checklist needs (task/version-editor/release-draft-version, criterion 2):
 * each entry's own hypothesis-revision's collected concept names
 * (domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision).
 * Position and the revision's own criterion/resolution are left unread,
 * matching use-manifest-builder.ts's own narrower-than-the-full-DTO
 * projection convention for this same endpoint.
 */
export type CaseVersionManifestEntry = {
  readonly hypothesis_revision: {
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
