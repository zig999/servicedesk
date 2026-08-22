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

/** The form's own save state machine (proposal section 4): clean while nothing has changed since the last successful load or save, dirty after an edit, saving while the PATCH is in flight, and conflict once the backend refuses because someone else released the version first. */
export type SaveStatus = "clean" | "dirty" | "saving" | "conflict";

/**
 * The subset of GET/PATCH's read-case response this form reads or writes.
 * Exported so a caller seeding this hook from a just-created draft's own
 * submitted content (task/version-editor/new-draft-creation) can build one
 * without re-declaring the shape.
 */
export type CaseVersionRecord = {
  readonly title: string;
  readonly when_to_use: string;
  readonly subject: string;
  readonly fallback: CaseVersionFormValues["fallback"];
  readonly consolidation_register?: CaseVersionFormValues["consolidation_register"];
};

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
    };

function resetFormFrom(
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
  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");

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
    isBlocked: status === "saving" || status === "conflict",
    outcomeOptions,
    actionOptions,
    recipientOptions,
    onSubmit: submit,
    onFieldBlur: () => {
      if (status === "dirty") {
        void submit();
      }
    },
  };
}
