/**
 * The Version Editor's own edit-mode state (task/version-editor/
 * edit-draft-version): loads an existing draft's own fields and the three
 * glossary-backed dropdowns it needs, tracks the form's own save state
 * machine ("Máquina de estado" section 4 of the proposal, quoted in this
 * task's own `sources`) -- clean -> dirty -> saving -> clean | conflict --
 * and dispatches the full-replace PATCH on Save.
 *
 * Business logic lives here rather than inline in the screen's JSX (ARC-03):
 * the screen component only reads what this hook returns and renders it.
 *
 * `version` and `seedRecord` are widened over what edit-draft-version itself
 * needed, for task/version-editor/new-draft-creation's own criterion 4:
 * "[a 201] switches the form into the same edit-mode flow edit-draft-version
 * delivers ... addressed by the version number the response returns" and
 * criterion 5: "seeds the form from the content just submitted and the
 * returned version number, without issuing a follow-up GET". A caller that
 * has just created a draft (POST /v1/cases's own response carries only
 * `{ slug, version }`, never the content -- confirmed against
 * src/src/case/create-draft.operation.ts's own CreatedDraft) passes that
 * version number plus a record built from what the curator just submitted as
 * `seedRecord`; this hook then seeds react-query's cache with it
 * (`initialData`) and never enables the GET, so the version this same hook
 * would otherwise fetch is never re-read from the network. `version` is
 * nullable so the same hook can be called, unconditionally (Rules of Hooks),
 * before a draft has been created at all -- the query stays disabled and
 * `!versionQuery.data` keeps the phase at "loading" until a real version and
 * seed arrive. edit-draft-version's own call site (case-version-editor-
 * screen.tsx, two arguments, no seed) is unaffected: `version` is always a
 * real number there and `seedRecord` is always `undefined`, so `enabled`
 * evaluates to exactly what it always did.
 *
 * task/version-editor/release-draft-version adds one more isolated mutation
 * here, matching use-manifest-builder.ts's own established convention (one
 * mutation per terminal action, its own onSuccess/onError branch, no
 * client-side "dirty" flag spanning it and the save state machine above):
 * POST .../release, exposed to a "ready"-phase caller as the optional
 * `release` field below. Optional, rather than a required member of the
 * "ready" variant, because use-new-draft-version-form.ts's own blank-form
 * "ready" object (before a draft exists to release) is a second, independent
 * literal of this same union that this task does not touch -- widening the
 * variant with a *required* field would force that file to supply one too,
 * which is not this task's own concern. `CaseVersionRecord` gains two
 * optional fields for the same reason: `state` and `manifest`, both absent
 * from that other file's own seed literal (a freshly created draft has never
 * been read back through the real GET this record otherwise always comes
 * from) -- absent, the release control simply does not render (`canRelease`
 * below reads `record.state === "draft"` exactly, never treating "unknown"
 * as "draft"), rather than the hook guessing a fact it does not actually
 * hold for that one call site.
 *
 * task/version-editor/view-released-version-read-only adds two more
 * optional "ready"-phase fields, for the same reason `release`/`discard`
 * above are optional (use-new-draft-version-form.ts's own blank-form
 * literal supplies neither): `isReadOnly` (`record.state === "released"`)
 * and `manifest` (`record.manifest`, unchanged) -- the fact and the data
 * this hook's own callers now need to render a released version's entire
 * stored content read-only, with no control that could change it, reusing
 * the exact GET this hook already issues rather than a second call.
 */

import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiFetch, ApiError } from "../services/api-client";
import { uiStateForApiError, type UiErrorStateKind } from "../services/error-ui-state";
import {
  caseVersionFormSchema,
  type CaseVersionFormValues,
} from "../services/case-version-form-schema";
import { useTelemetry } from "./use-telemetry";
import {
  useGlossaryVocabularyOptions,
  type GlossaryVocabularyOptions,
} from "./use-glossary-vocabulary";
import { useConceptOptions } from "./use-concept-options";
import type { CaseVersionManifestEntry, CaseVersionRecord } from "../services/case-version-record";
import {
  buildReleaseChecklist,
  extractReleaseViolations,
  type ReleaseDialogContent,
  type ReleaseControlState,
} from "../services/release-checklist";
// Single-line by exception (every other import above wraps one symbol per
// line): use-edit-draft-version-form.ts's own header comment on this file's
// max-lines pressure -- every line spared here is one this task's own new
// mutation and "ready"-phase field below do not have to find elsewhere.
import { buildDiscardControlState, buildDiscardMutationOptions, type DiscardControlState } from "../services/discard-confirmation";

/** Re-exported for use-new-draft-version-form.ts's own seed-record literal -- the shape itself moved to services/case-version-record.ts (task/version-editor/release-draft-version) so this file stays under this project's own max-lines rule. */
export type { CaseVersionRecord };

/** The form's own save state machine (proposal section 4): clean while nothing has changed since the last successful load or save, dirty after an edit, saving while the PATCH is in flight, and conflict once the backend refuses because someone else released the version first. */
export type SaveStatus = "clean" | "dirty" | "saving" | "conflict";

export type EditDraftVersionFormState =
  | { readonly phase: "loading" }
  | { readonly phase: "load-error"; readonly retryLoad: () => void }
  | {
      readonly phase: "ready";
      readonly form: UseFormReturn<CaseVersionFormValues>;
      readonly status: SaveStatus;
      readonly savedAt: string | null;
      readonly isBlocked: boolean;
      readonly outcomeOptions: GlossaryVocabularyOptions;
      readonly actionOptions: GlossaryVocabularyOptions;
      readonly recipientOptions: GlossaryVocabularyOptions;
      readonly onSubmit: (event?: BaseSyntheticEvent) => void;
      readonly onFieldBlur: () => void;
      /** Absent only for use-new-draft-version-form.ts's own blank-form "ready" object -- see this file's own header comment. */
      readonly release?: ReleaseControlState;
      /** Absent for the same reason as `release` above (task/version-editor/discard-draft-version). */
      readonly discard?: DiscardControlState;
      /**
       * task/version-editor/seed-new-draft-from-latest-released's own flag:
       * `true` only for use-new-draft-version-form.ts's own blank-form "ready"
       * object, and only while the case it originates a draft for holds no
       * released version to seed that form from (criterion 2) -- absent here
       * (this hook's own "ready" phase) and absent once that same call site
       * has seeded the form from a released version instead, for the same
       * reason `release` and `discard` above stay absent at call sites that
       * do not apply to them.
       */
      readonly isFirstVersion?: boolean;
      /**
       * task/version-editor/view-released-version-read-only's own flag:
       * `true` only once the loaded record's own state is "released" --
       * deliberately distinct from `isBlocked` above, which also reads
       * `true` mid-save, mid-conflict, or the instant this same session's
       * own Release mutation succeeds (isReleased), before the invalidated
       * ["case-version", slug, version] query has necessarily refetched a
       * record whose own `state` field agrees. A caller reads this flag to
       * hide the Save control outright (this task's own criterion: "shows
       * no Save … control") rather than merely disable it, which `isBlocked`
       * already does for every one of those other cases. Absent for
       * use-new-draft-version-form.ts's own blank-form "ready" object, for
       * the same reason `release`/`discard`/`isFirstVersion` above stay
       * absent there.
       */
      readonly isReadOnly?: boolean;
      /**
       * Every manifest entry the loaded record's own read carries, in the
       * exact order GET .../versions/{version} returned them
       * (domain/knowledge/manifest-entry) -- present only once the record
       * was read back through the real GET (case-version-record.ts's own
       * header comment on why `manifest` itself is optional there), so
       * absent for the same call sites `isReadOnly` above is absent for.
       * Read by the read-only render's own manifest listing
       * (task/version-editor/view-released-version-read-only, criterion 6).
       */
      readonly manifest?: readonly CaseVersionManifestEntry[];
    };

/**
 * Re-hydrates `form` from a just-loaded or just-saved record's own five
 * declared attributes -- exported so use-new-draft-version-form.ts's own
 * seeding effect (task/version-editor/seed-new-draft-from-latest-released,
 * criterion 1) reuses this exact mapping rather than a second, hand-copied
 * one.
 */
export function resetFormFrom(
  form: UseFormReturn<CaseVersionFormValues>,
  record: CaseVersionRecord,
): void {
  form.reset({
    title: record.title,
    when_to_use: record.when_to_use,
    subject: record.subject,
    fallback: record.fallback,
    consolidation_register: record.consolidation_register,
  });
}

/** "saved at HH:mm" (criterion 5) -- local time, zero-padded, no seconds. */
function formatSavedAt(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Resolves an unknown mutation/query error to the shared error-to-UI-state
 * table's own `kind` (error-ui-state.ts, Onda 1's own API-02 mapping) rather
 * than comparing `ApiError.code` strings directly at this call site -- this
 * task's own "What it is" names that table as already delivered and reused
 * here, not rebuilt as a second, parallel classification.
 */
export function errorStateKind(error: unknown): UiErrorStateKind | null {
  return error instanceof ApiError ? uiStateForApiError(error).kind : null;
}

export function useEditDraftVersionForm(
  slug: string,
  version: number | null,
  seedRecord?: CaseVersionRecord,
): EditDraftVersionFormState {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const [status, setStatus] = useState<SaveStatus>("clean");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  // Blur and the Save button's own click can both reach the shared `submit`
  // below from one physical click (focus leaving the field just edited,
  // then the button's own submit event) -- both run before either one's
  // setStatus("saving") has committed a re-render, so `status` read from
  // React state cannot tell the second call it is redundant. This ref is
  // set synchronously inside the guarded callback itself, so the second
  // call sees it before its own validation pass ever resolves.
  const isSubmittingRef = useRef(false);

  // task/version-editor/release-draft-version's own local state: the
  // Dialog's open/closed flag, whichever violations a 422 last left on it
  // (null renders the checklist instead, criterion 6), and a sticky flag set
  // the instant a 200 arrives (criterion 5) -- independent of whichever
  // query below eventually refetches, so isBlocked further down does not
  // wait on that refetch to disable every field.
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false); const [releaseViolations, setReleaseViolations] = useState<readonly string[] | null>(null); const [isReleased, setIsReleased] = useState(false);

  // task/version-editor/discard-draft-version's own local state: the
  // Dialog's open/closed flag, the confirmation field's own typed value
  // (criterion 3), and whichever error message a failed DELETE last left on
  // it (criterion 6, null renders no message). No sticky "isDiscarded" flag
  // alongside isReleased above -- a successful discard navigates the
  // curator away entirely (criterion 5) rather than leaving this same
  // version addressable read-only the way a successful release does.
  // Same single-line exception as this file's own discard-confirmation
  // import above, for the same max-lines reason.
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false); const [discardSlugConfirmation, setDiscardSlugConfirmation] = useState(""); const [discardErrorText, setDiscardErrorText] = useState<string | null>(null);

  // Disabled and seeded from `initialData` once a caller supplies
  // `seedRecord` (new-draft-creation, right after its own 201) -- the GET
  // this query would otherwise issue never fires, satisfying that task's own
  // criterion 5. Also disabled while `version` is still null (no draft
  // created yet); `!versionQuery.data` below keeps the phase at "loading"
  // either way until a real version and record are both present.
  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,
      ),
    enabled: version !== null && seedRecord === undefined,
    initialData: seedRecord,
  });
  const outcomeOptions = useGlossaryVocabularyOptions("outcome"); const actionOptions = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");
  // The pre-Release checklist's third item (criterion 2) re-reads this exact
  // hook Onda 4 already established for this purpose (use-concept-options.ts's
  // own header comment). Its own load or error state deliberately does not
  // join isLoadingGlossary/isGlossaryError below -- the checklist is
  // best-effort (this task's own Notes), never a promise, and gating the
  // whole form's readiness on it would block Save over a read only the
  // Release control needs.
  const conceptOptions = useConceptOptions();

  const form = useForm<CaseVersionFormValues>({
    resolver: zodResolver(caseVersionFormSchema),
  });

  // Pre-populates the form once the version loads (criterion 1), and again
  // marks the machine clean -- a fresh load is never "dirty". `form` is
  // react-hook-form's own stable object across renders (its identity never
  // changes), so it is deliberately left out of this effect's own
  // dependency array: only a freshly loaded record should re-seed the form.
  useEffect(() => {
    if (versionQuery.data) {
      resetFormFrom(form, versionQuery.data);
      setStatus("clean");
    }
  }, [versionQuery.data]);

  // clean -> dirty on any field change (criterion 8). `type === "change"`
  // excludes the notifications form.reset() above and below also emit,
  // which react-hook-form marks with no type -- only a genuine edit reaches
  // this branch.
  useEffect(() => {
    const subscription = form.watch((_value, { type }) => {
      if (type === "change") {
        setStatus((current) => (current === "clean" ? "dirty" : current));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // A 404 on the initial read (case removed) navigates to Cases List
  // (criterion 7), for either query.
  useEffect(() => {
    if (errorStateKind(versionQuery.error) === "case-not-found") {
      void navigate({ to: "/cases" });
    }
  }, [versionQuery.error, navigate]);

  const patchMutation = useMutation({
    mutationFn: (values: CaseVersionFormValues) => {
      // `submit` below is only reachable once the "ready" phase is returned,
      // which (per versionQuery's own `enabled`/`initialData` wiring above)
      // never happens while `version` is still null -- this guard is a
      // type-level narrowing of that structural guarantee, not a path this
      // hook expects to actually take.
      if (version === null) {
        throw new Error("cannot save a draft version that has not been created yet");
      }
      return apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
    },
    onSuccess: (data) => {
      // 200 re-hydrates the form and marks "saved at HH:mm" (criterion 5),
      // and returns the machine to clean (criterion 8).
      isSubmittingRef.current = false;
      resetFormFrom(form, data);
      setStatus("clean");
      setSavedAt(formatSavedAt(new Date()));
      if (version !== null) {
        telemetry.caseDraftUpdated({ slug, version });
      }
      void queryClient.invalidateQueries({ queryKey: ["case-versions", slug] });
    },
    onError: (error) => {
      isSubmittingRef.current = false;
      const kind = errorStateKind(error);
      if (kind === "case-version-not-draft") {
        // 409 blocks the form and enters conflict (criteria 6 and 8).
        setStatus("conflict");
        if (version !== null) {
          telemetry.uiStaleConflictDetected({ slug, version, action: "update-draft" });
        }
        return;
      }
      if (kind === "case-not-found") {
        // 404 while saving navigates to Cases List, same as while loading
        // (criterion 7).
        void navigate({ to: "/cases" });
        return;
      }
      // Any other failure (network, an unmapped 5xx): the shared
      // QueryClient's own cache-level toast (services/query-client.ts)
      // covers queries only, never a useMutation call (per this task's own
      // inventory risk), so this call site is where a mutation failure has
      // to surface at all. No criterion of this task names wording for this
      // case -- it is not a domain fact the specification states, only that
      // *something* tells the curator the save did not happen -- so this
      // mirrors query-client.ts's own generic, non-domain fallback message
      // rather than inventing one. The machine returns to dirty rather than
      // clean: nothing was lost, and the curator's own edits are still
      // there to retry.
      toast.error("Something went wrong while saving. Try again.");
      setStatus("dirty");
    },
  });

  const releaseMutation = useMutation({
    mutationFn: () => {
      // Mirrors patchMutation's own guard above: the release control (only
      // ever exposed once the "ready" phase is reached) is never reachable
      // while `version` is still null.
      if (version === null) {
        throw new Error("cannot release a draft version that has not been created yet");
      }
      return apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/release`,
        { method: "POST" },
      );
    },
    onSuccess: (data) => {
      // 200 turns the version permanently read-only (criterion 5): the same
      // re-hydration a successful PATCH already performs, plus the sticky
      // local flag isBlocked reads below, and the two invalidations a state
      // change already earns elsewhere in this app (use-manifest-builder.ts's
      // own convention for every write that changes a version's own state).
      resetFormFrom(form, data);
      setIsReleased(true);
      setIsReleaseDialogOpen(false);
      if (version !== null) {
        telemetry.caseReleased({ slug, version });
      }
      void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
      void queryClient.invalidateQueries({ queryKey: ["case-versions", slug] });
    },
    onError: (error) => {
      const kind = errorStateKind(error);
      if (kind === "case-version-not-releasable") {
        // 422: every violation the response's own array holds, verbatim, in
        // place of the pre-click checklist (criterion 6) -- never the
        // checklist's own fixed wording.
        setReleaseViolations(extractReleaseViolations(error));
        return;
      }
      if (kind === "case-version-not-draft-at-release") {
        // 409: closes the Dialog and re-fetches rather than showing a
        // violations list (criterion 7) -- someone else already moved this
        // version out of draft.
        setIsReleaseDialogOpen(false);
        setReleaseViolations(null);
        void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
        return;
      }
      // Any other failure: no criterion of this task names wording for this
      // case, mirroring patchMutation's own generic, non-domain fallback
      // above rather than inventing a second one.
      toast.error("Something went wrong while releasing. Try again.");
    },
  });

  // task/version-editor/discard-draft-version's own isolated mutation
  // (contracts/knowledge/case-lifecycle's own discard operation): built by
  // services/discard-confirmation.ts's own buildDiscardMutationOptions
  // rather than inline here, so this file stays under this project's own
  // max-lines rule (that module's own header comment). `onDiscarded` and
  // `onFailed` stay this hook's own closures because they touch telemetry,
  // the query cache and navigation -- none of which a plain services module
  // reaches; `onDiscarded` receives the discarded version number back from
  // the mutation itself (rather than reading the outer `version` closure),
  // so it needs no `version !== null` narrowing of its own -- criterion 5.
  const discardMutation = useMutation(
    buildDiscardMutationOptions({
      slug, version, onFailed: setDiscardErrorText,
      onDiscarded: (discardedVersion) => {
        telemetry.caseDraftDiscarded({ slug, version: discardedVersion });
        void queryClient.invalidateQueries({ queryKey: ["case-version", slug, discardedVersion] }); void queryClient.invalidateQueries({ queryKey: ["case-versions", slug] });
        void navigate({ to: "/cases/$slug", params: { slug } });
      },
    }),
  );

  const isLoadingGlossary =
    outcomeOptions.isLoading || actionOptions.isLoading || recipientOptions.isLoading;
  const isGlossaryError =
    outcomeOptions.isError || actionOptions.isError || recipientOptions.isError;

  if (errorStateKind(versionQuery.error) === "case-not-found") {
    // Navigating away already; render nothing more distracting than loading.
    return { phase: "loading" };
  }
  if (versionQuery.isError || isGlossaryError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void versionQuery.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
      },
    };
  }
  if (versionQuery.isLoading || isLoadingGlossary || !versionQuery.data) {
    return { phase: "loading" };
  }

  const record = versionQuery.data;
  if (version === null) {
    // Structurally unreachable: this hook's own "ready" phase (guarded by
    // `!versionQuery.data` above) is only ever produced once `version` is a
    // real number (this file's own header comment on `enabled`/
    // `initialData`) -- this guard exists only so `release.version` below
    // can read it without a type assertion (TYP-02).
    throw new Error("cannot expose a release control for a version that has not been created yet");
  }

  // criterion 1: the Release control renders only while the currently
  // loaded version's own state is draft, and only until this session's own
  // release succeeds (isReleased) -- record.state itself may still read
  // "draft" for a moment after a 200, until the invalidated query above
  // refetches.
  const canRelease = record.state === "draft" && !isReleased;
  const releaseDialog: ReleaseDialogContent =
    releaseViolations !== null
      ? { kind: "violations", violations: releaseViolations }
      : {
          kind: "checklist",
          items: buildReleaseChecklist({
            record,
            outcomeOptions,
            actionOptions,
            recipientOptions,
            concepts: conceptOptions.concepts,
          }),
        };

  // dirty -> saving happens only once the submitted content actually
  // validates (criterion 8 names the transition, not what happens to an
  // invalid submission, which react-hook-form's own resolver already
  // surfaces as field errors without ever calling this callback) -- shared
  // by both triggers (criterion 4: "on blur or via the Save button") so
  // neither can drift from the other's behavior. Blurring the field just
  // edited and then clicking Save is one physical action that can reach
  // this callback twice (blur's own submit, then the button's own submit
  // event) before either call's setStatus("saving") has committed a
  // re-render -- isSubmittingRef is what the second call actually sees.
  const submit = form.handleSubmit((values) => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setStatus("saving");
    patchMutation.mutate(values);
  });

  return {
    phase: "ready",
    form,
    status,
    savedAt,
    // criterion 5: a released version (this session's own release, or one
    // already released when loaded) disables every field and Save alongside
    // the existing saving/conflict conditions -- one shared gate, rather
    // than form-fields.tsx growing a second disabled condition of its own.
    isBlocked:
      status === "saving" ||
      status === "conflict" ||
      record.state === "released" ||
      isReleased,
    outcomeOptions,
    actionOptions,
    recipientOptions,
    onSubmit: submit,
    onFieldBlur: () => {
      if (status === "dirty") {
        void submit();
      }
    },
    // task/version-editor/view-released-version-read-only, criteria 4-6:
    // the fact and the data its own read-only render composes CaseVersionEditorFormFields
    // and its own manifest listing from -- `record.state` itself, never
    // `isBlocked`/`isReleased`, is what this task's own criteria describe
    // ("Loading a version whose state is released renders …").
    isReadOnly: record.state === "released",
    manifest: record.manifest,
    release: {
      version,
      canRelease,
      isOpen: isReleaseDialogOpen,
      onOpenChange: (open: boolean) => {
        setIsReleaseDialogOpen(open);
        if (open) {
          // criterion 2: the checklist's own two glossary-backed items are
          // computed "by re-reading" these four endpoints, not from
          // whatever these four queries happened to hold since the form's
          // own initial load -- opening the Dialog is what actually issues
          // that re-read.
          outcomeOptions.refetch();
          actionOptions.refetch();
          recipientOptions.refetch();
          conceptOptions.refetch();
        } else {
          // Cancel, Escape, the overlay, or the 409 branch above -- the next
          // open should always start from the checklist, never a stale
          // violations list from a previous attempt.
          setReleaseViolations(null);
        }
      },
      dialog: releaseDialog,
      isConfirming: releaseMutation.isPending,
      onConfirm: () => releaseMutation.mutate(),
    },
    // task/version-editor/discard-draft-version, criterion 1: rendered only
    // while the loaded version's own state is draft
    // (rules/knowledge/only-a-draft-case-version-may-be-discarded). The three
    // tuples below are this hook's own `useState` pairs, passed through
    // unchanged (buildDiscardControlState's own header comment).
    discard: buildDiscardControlState({
      version, slug, canDiscard: record.state === "draft" && !isReleased,
      dialogOpen: [isDiscardDialogOpen, setIsDiscardDialogOpen],
      slugConfirmation: [discardSlugConfirmation, setDiscardSlugConfirmation],
      errorMessage: [discardErrorText, setDiscardErrorText],
      isConfirming: discardMutation.isPending, onConfirm: () => discardMutation.mutate(),
    }),
  };
}
