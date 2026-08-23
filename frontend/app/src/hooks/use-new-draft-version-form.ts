/**
 * The New Draft origination flow's own state (task/version-editor/
 * new-draft-creation): a blank instance of the Version Editor's shared field
 * form (task/version-editor/edit-draft-version), pre-set only with the one
 * subject-type value GET /v1/glossary/subject-type currently returns
 * (criterion 2), whose first Save dispatches POST /v1/cases rather than
 * PATCH (criterion 3).
 *
 * task/version-editor/seed-new-draft-from-latest-released widens both of
 * those: the blank form is pre-populated from the case's own latest released
 * version's own attributes when one exists
 * (rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version's
 * own "naming no source version copies the case's own latest released
 * version instead" clause), and the create POST additionally carries
 * consolidation_register and source_version once seeded that way (that same
 * task's own criteria 1 and 3). A case with no released version yet is left
 * exactly as new-draft-creation rendered it (criteria 2 and 4 of that later
 * task) -- blank, subject pre-set from the glossary, and the POST carries
 * neither of the two added fields.
 *
 * The case's own version list is read through useCaseVersions, the same
 * ["case-versions", slug] read task/cases-list-and-detail/case-detail-timeline
 * already established (this task's own rationale) -- the case's own latest
 * released version is the highest-numbered entry that list names with state
 * "released", version numbers never being reused or reassigned
 * (domain/knowledge/case's own next_version). Its own attributes are then
 * read through GET /v1/cases/{slug}/versions/{version}
 * (task/version-editor/edit-draft-version's own read), keyed the same way
 * (["case-version", slug, version]) so a curator revisiting that same,
 * immutable, released version elsewhere in this app shares one cache entry.
 * resetFormFrom, used below, is exported by use-edit-draft-version-form.ts
 * (that hook's own helper) so this file adds no second, hand-copied mapping
 * of a CaseVersionRecord onto the shared form shape.
 *
 * A 201 response switches the form into the exact same edit-mode flow
 * useEditDraftVersionForm delivers for an existing draft, addressed by the
 * version number the response returns (criterion 4), seeded from the
 * content just submitted rather than a follow-up GET (criterion 5) --
 * POST /v1/cases's own response carries only `{ slug, version }`
 * (src/src/case/create-draft.operation.ts's own CreatedDraft), never the
 * content, so there is nothing else to seed it from and nothing a GET would
 * add that this hook does not already hold. `useEditDraftVersionForm` is
 * called unconditionally (Rules of Hooks) with `version` staying `null`
 * until that switch happens; its own widened signature (see that hook's own
 * header comment) is exactly what makes this delegation possible without
 * ever issuing the GET it would otherwise perform.
 *
 * A 409 CaseAlreadyHasDraftError shows a toast stating a draft already
 * exists for the case and navigates to that case's existing draft version,
 * resolved by reading GET /v1/cases/{slug}/versions (criterion 6) -- read
 * through a plain, uncached apiFetch call rather than useCaseVersions's own
 * cached query above, deliberately: this read is best-effort (this task's
 * own header comment on its own onError branch) and must never surface a
 * second, generic "failed to load" toast of its own alongside the
 * domain-specific one already shown, which routing it through the shared
 * QueryClient's own QueryCache-level onError (services/query-client.ts)
 * would risk on every failure, not only this one.
 *
 * Deliberately never calls `navigate()` to the general "/cases/$slug/
 * versions/$version" route after a successful create, even though
 * intake/onda-3-scope.md's own prose describes the outcome as "navega para a
 * versão recém-criada": doing so would leave the browser addressable at that
 * route, and a refresh there re-mounts CaseVersionEditorScreen, which always
 * issues the very GET this hook exists to avoid -- landing on a version
 * whose manifest is still empty, which read-case.dto.ts's own
 * `manifest.min(1)` constraint cannot describe (this task's own Notes). The
 * form stays addressable at "/cases/$slug/versions/new" instead, using the
 * created version number only to parametrize the PATCH this same hook now
 * dispatches -- criterion 4's "addressed by the version number" is read as a
 * fact about which resource Save now updates, not about the browser's own
 * location. Disclosed as this task's own inference.
 *
 * Business logic lives here rather than inline in the screen's JSX (ARC-03),
 * matching use-edit-draft-version-form.ts's own convention.
 */

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch } from "../services/api-client";
import {
  caseVersionFormSchema,
  type CaseVersionFormValues,
} from "../services/case-version-form-schema";
import { useTelemetry } from "./use-telemetry";
import { useGlossaryVocabularyOptions } from "./use-glossary-vocabulary";
import { useCaseVersions, type CaseVersionsPage } from "./use-case-versions";
import {
  errorStateKind,
  resetFormFrom,
  useEditDraftVersionForm,
  type CaseVersionRecord,
  type EditDraftVersionFormState,
} from "./use-edit-draft-version-form";

/**
 * POST /v1/cases's own request body (createDraftBodySchema, src/src/http/
 * dto/create-draft.dto.ts) -- widened by task/version-editor/
 * seed-new-draft-from-latest-released over new-draft-creation's own narrower
 * literal (that task's own inventory risk) to additionally carry
 * consolidation_register and source_version once the blank form was seeded
 * from the case's own latest released version. Both stay optional: a
 * first-ever draft (no released version to seed from) sends neither
 * (criterion 4), exactly as new-draft-creation's own POST always did.
 */
type CreateDraftRequestBody = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
  readonly consolidation_register?: CaseVersionFormValues["consolidation_register"];
  readonly source_version?: number;
};

/** POST /v1/cases's own response -- confirmed against src/src/case/create-draft.operation.ts's own CreatedDraft: the identity a curator now edits, nothing else. */
type CreatedDraft = {
  readonly slug: string;
  readonly version: number;
};

/**
 * Originates a new draft for the named case. Returns the exact same
 * EditDraftVersionFormState shape useEditDraftVersionForm returns, so the
 * screen composing this hook renders through the identical
 * CaseVersionEditorFormFields / conflict-banner markup edit-draft-version
 * already delivers, whichever of the two phases (creating, or already
 * switched into edit mode) is current.
 */
export function useNewDraftVersionForm(slug: string): EditDraftVersionFormState {
  const navigate = useNavigate();
  const telemetry = useTelemetry();
  const isSubmittingRef = useRef(false);
  const [created, setCreated] = useState<{
    readonly version: number;
    readonly record: CaseVersionRecord;
  } | null>(null);

  const subjectOptions = useGlossaryVocabularyOptions("subject-type");
  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

  // task/version-editor/seed-new-draft-from-latest-released: the case's own
  // version timeline, read through the same ["case-versions", slug] query
  // task/cases-list-and-detail/case-detail-timeline already established
  // (this task's own rationale on reusing that read rather than a second
  // one). The case's own latest released version is the highest-numbered
  // entry this list names with state "released" -- version numbers are
  // never reused (domain/knowledge/case's own next_version), so the highest
  // one among the released entries is unambiguous; `undefined` where the
  // list holds none (criterion 2), which this task's own Notes call this
  // task's own reading of "the case's own latest released version" per
  // rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version.
  const versionsQuery = useCaseVersions(slug);
  const latestReleasedVersionNumber = versionsQuery.data?.data
    .filter((item) => item.state === "released")
    .reduce<number | undefined>(
      (latest, item) => (latest === undefined || item.version > latest ? item.version : latest),
      undefined,
    );
  const hasLoadedVersions = versionsQuery.data !== undefined;

  // Reads that version's own title/when_to_use/subject/fallback/
  // consolidation_register (criterion 1) through the exact call and cache
  // key task/version-editor/edit-draft-version's own versionQuery already
  // uses (use-edit-draft-version-form.ts's own header comment) -- disabled
  // until the version list above has resolved one to read.
  const sourceVersionQuery = useQuery({
    queryKey: ["case-version", slug, latestReleasedVersionNumber ?? null],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${latestReleasedVersionNumber}`,
      ),
    enabled: latestReleasedVersionNumber !== undefined,
  });

  const createForm = useForm<CaseVersionFormValues>({
    resolver: zodResolver(caseVersionFormSchema),
    defaultValues: {
      title: "",
      when_to_use: "",
      subject: "",
      fallback: { outcome: "", referral: { action: "", recipient: "" } },
    },
  });

  // Pre-sets the subject field to the one subject-type value GET
  // /v1/glossary/subject-type currently returns (criterion 2), once that
  // vocabulary loads -- but only once the version list above has resolved
  // and named no released version to seed from instead: seeding a case that
  // does hold one runs entirely through the effect below, which this effect
  // must never race (whichever of the two effects fires last would win).
  // Depends on the resolved value itself and `latestReleasedVersionNumber`,
  // both primitives, plus the boolean `hasLoadedVersions` -- rather than
  // `subjectOptions.options` or `versionsQuery.data` (fresh array/object
  // references on every render) -- keying this effect on an unstable
  // reference would re-run it, and re-assign the same value, on every
  // unrelated re-render of this hook (every keystroke into another field),
  // rather than only when one of these three facts actually changes.
  // `createForm` is react-hook-form's own stable object across renders (its
  // identity never changes), left out of this effect's own dependency array,
  // matching useEditDraftVersionForm's own established convention for the
  // same reason.
  const subjectValue = subjectOptions.options[0]?.value;
  useEffect(() => {
    if (
      subjectValue !== undefined &&
      hasLoadedVersions &&
      latestReleasedVersionNumber === undefined
    ) {
      createForm.setValue("subject", subjectValue);
    }
  }, [subjectValue, hasLoadedVersions, latestReleasedVersionNumber]);

  // criterion 1: once the case's own latest released version's own record
  // loads, pre-populates the blank form's title, when_to_use, subject,
  // fallback and consolidation_register from it, through
  // use-edit-draft-version-form.ts's own resetFormFrom -- the exact mapping
  // that hook's own initial load already performs, reused rather than
  // hand-copied a second time.
  useEffect(() => {
    if (sourceVersionQuery.data) {
      resetFormFrom(createForm, sourceVersionQuery.data);
    }
  }, [sourceVersionQuery.data]);

  // Resolves the 409 race (criterion 6): reads the case's own version list
  // and navigates to whichever version that list names as the existing
  // draft. The toast already told the curator a draft exists; a failure to
  // resolve which one, or a case whose draft has since been discarded
  // between the 409 and this read, leaves the curator on this screen rather
  // than navigating somewhere no criterion of this task names.
  async function redirectToExistingDraft(): Promise<void> {
    try {
      const page = await apiFetch<CaseVersionsPage>(
        `/v1/cases/${encodeURIComponent(slug)}/versions`,
      );
      const existingDraft = page.data.find((item) => item.state === "draft");
      if (existingDraft) {
        void navigate({
          to: "/cases/$slug/versions/$version",
          params: { slug, version: String(existingDraft.version) },
        });
      }
    } catch {
      // Nothing further to tell the curator beyond the toast already shown;
      // see this function's own header comment.
    }
  }

  const createMutation = useMutation({
    mutationFn: (values: CaseVersionFormValues) => {
      const body: CreateDraftRequestBody = {
        slug,
        authored_at: new Date().toISOString(),
        title: values.title,
        when_to_use: values.when_to_use,
        subject: values.subject,
        fallback: values.fallback,
        // criterion 3: named explicitly only once the blank form was seeded
        // from the case's own latest released version; a first-ever draft
        // (criterion 4, no released version to seed from) sends neither,
        // matching new-draft-creation's own POST body exactly.
        ...(latestReleasedVersionNumber !== undefined
          ? {
              consolidation_register: values.consolidation_register,
              source_version: latestReleasedVersionNumber,
            }
          : {}),
      };
      return apiFetch<CreatedDraft>("/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data, values) => {
      // Seeds the switch to edit mode from the content just submitted and
      // the returned version number, never a follow-up GET (criterion 5).
      isSubmittingRef.current = false;
      telemetry.caseDraftCreated({ slug, version: data.version });
      setCreated({
        version: data.version,
        record: {
          title: values.title,
          when_to_use: values.when_to_use,
          subject: values.subject,
          fallback: values.fallback,
          consolidation_register: values.consolidation_register,
        },
      });
    },
    onError: (error) => {
      isSubmittingRef.current = false;
      const kind = errorStateKind(error);
      if (kind === "case-already-has-draft") {
        toast.error(`A draft already exists for the case "${slug}".`);
        void redirectToExistingDraft();
        return;
      }
      // Any other failure (network, an unmapped 5xx): no criterion of this
      // task names wording for this case, only that *something* tells the
      // curator the save did not happen -- mirrors
      // useEditDraftVersionForm's own generic, non-domain fallback message
      // rather than inventing a second one.
      toast.error("Something went wrong while saving. Try again.");
    },
  });

  // Delegates entirely to the edit-mode hook once a draft exists
  // (criterion 4) -- called unconditionally (Rules of Hooks) with `version`
  // staying `null`, and no `seedRecord`, until `created` is set; from then
  // on this hook's own return value is exactly whatever that call returns.
  const editState = useEditDraftVersionForm(slug, created?.version ?? null, created?.record);

  if (created) {
    return editState;
  }

  // Widened by task/version-editor/seed-new-draft-from-latest-released to
  // also gate on the case's own version list, and -- only once that list
  // names a released version to seed from -- on that version's own record,
  // so the blank form never renders (and then visibly re-populates a moment
  // later) before its own seeding effect above has had a chance to run.
  const isLoadingVersionSource =
    versionsQuery.isLoading ||
    (latestReleasedVersionNumber !== undefined && sourceVersionQuery.data === undefined);
  const isVersionSourceError =
    versionsQuery.isError || (latestReleasedVersionNumber !== undefined && sourceVersionQuery.isError);

  const isLoadingGlossary =
    subjectOptions.isLoading ||
    outcomeOptions.isLoading ||
    actionOptions.isLoading ||
    recipientOptions.isLoading ||
    isLoadingVersionSource;
  const isGlossaryError =
    subjectOptions.isError ||
    outcomeOptions.isError ||
    actionOptions.isError ||
    recipientOptions.isError ||
    isVersionSourceError;

  if (isGlossaryError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        subjectOptions.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
        void versionsQuery.refetch();
        if (latestReleasedVersionNumber !== undefined) {
          void sourceVersionQuery.refetch();
        }
      },
    };
  }
  if (isLoadingGlossary) {
    return { phase: "loading" };
  }

  // The blank form is savable from the moment it renders (criterion 3 names
  // only "clicking Save issues POST", not a prior edit) -- unlike
  // useEditDraftVersionForm's own clean/dirty distinction (nothing to
  // compare a first save against), so Save stays enabled throughout except
  // while the POST is in flight.
  const submit = createForm.handleSubmit((values) => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    createMutation.mutate(values);
  });

  return {
    phase: "ready",
    form: createForm,
    status: createMutation.isPending ? "saving" : "dirty",
    savedAt: null,
    isBlocked: createMutation.isPending,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    onSubmit: submit,
    // No criterion of this task asks for a blur-triggered auto-save on the
    // blank form (unlike edit-draft-version's own onFieldBlur, which saves
    // an existing draft's own correction) -- this is a no-op so the shared
    // field markup's own onBlur wiring has something to call.
    onFieldBlur: () => {
      // Deliberately no-op; see this property's own comment above.
    },
    // criterion 2: `true` exactly while the case holds no released version
    // to seed this blank form from -- read by NewCaseDraftScreen to render
    // the copy stating this is the case's first version.
    isFirstVersion: latestReleasedVersionNumber === undefined,
  };
}
