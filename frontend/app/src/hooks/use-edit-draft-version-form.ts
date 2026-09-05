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

import { buildDiscardControlState, buildDiscardMutationOptions, type DiscardControlState } from "../services/discard-confirmation";

export type { CaseVersionRecord };

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

      readonly release?: ReleaseControlState;

      readonly discard?: DiscardControlState;

      readonly isFirstVersion?: boolean;

      readonly isReadOnly?: boolean;

      readonly manifest?: readonly CaseVersionManifestEntry[];
    };

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

function formatSavedAt(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function errorStateKind(error: unknown): UiErrorStateKind | null {
  return error instanceof ApiError ? uiStateForApiError(error).kind : null;
}

export function useEditDraftVersionForm(
  slug: string,
  version: number | null,
): EditDraftVersionFormState {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const telemetry = useTelemetry();
  const [status, setStatus] = useState<SaveStatus>("clean");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false); const [releaseViolations, setReleaseViolations] = useState<readonly string[] | null>(null); const [isReleased, setIsReleased] = useState(false);

  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false); const [discardSlugConfirmation, setDiscardSlugConfirmation] = useState(""); const [discardErrorText, setDiscardErrorText] = useState<string | null>(null);

  const versionQuery = useQuery({
    queryKey: ["case-version", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}`,
      ),
    enabled: version !== null,
  });
  const outcomeOptions = useGlossaryVocabularyOptions("outcome"); const actionOptions = useGlossaryVocabularyOptions("action"); const recipientOptions = useGlossaryVocabularyOptions("recipient");

  const conceptOptions = useConceptOptions();

  const form = useForm<CaseVersionFormValues>({
    resolver: zodResolver(caseVersionFormSchema),
  });

  useEffect(() => {
    if (versionQuery.data) {
      resetFormFrom(form, versionQuery.data);
      setStatus("clean");
    }
  }, [versionQuery.data]);

  useEffect(() => {
    const subscription = form.watch((_value, { type }) => {
      if (type === "change") {
        setStatus((current) => (current === "clean" ? "dirty" : current));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (errorStateKind(versionQuery.error) === "case-not-found") {
      void navigate({ to: "/cases" });
    }
  }, [versionQuery.error, navigate]);

  const patchMutation = useMutation({
    mutationFn: (values: CaseVersionFormValues) => {

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

        setStatus("conflict");
        if (version !== null) {
          telemetry.uiStaleConflictDetected({ slug, version, action: "update-draft" });
        }
        return;
      }
      if (kind === "case-not-found") {

        void navigate({ to: "/cases" });
        return;
      }

      toast.error("Something went wrong while saving. Try again.");
      setStatus("dirty");
    },
  });

  const releaseMutation = useMutation({
    mutationFn: () => {

      if (version === null) {
        throw new Error("cannot release a draft version that has not been created yet");
      }
      return apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/release`,
        { method: "POST" },
      );
    },
    onSuccess: (data) => {

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

        setReleaseViolations(extractReleaseViolations(error));
        return;
      }
      if (kind === "case-version-not-draft-at-release") {

        setIsReleaseDialogOpen(false);
        setReleaseViolations(null);
        void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
        return;
      }

      toast.error("Something went wrong while releasing. Try again.");
    },
  });

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

    throw new Error("cannot expose a release control for a version that has not been created yet");
  }

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

    isReadOnly: record.state === "released",
    manifest: record.manifest,
    release: {
      version,
      canRelease,
      isOpen: isReleaseDialogOpen,
      onOpenChange: (open: boolean) => {
        setIsReleaseDialogOpen(open);
        if (open) {

          outcomeOptions.refetch();
          actionOptions.refetch();
          recipientOptions.refetch();
          conceptOptions.refetch();
        } else {

          setReleaseViolations(null);
        }
      },
      dialog: releaseDialog,
      isConfirming: releaseMutation.isPending,
      onConfirm: () => releaseMutation.mutate(),
    },

    discard: buildDiscardControlState({
      version, slug, canDiscard: record.state === "draft" && !isReleased,
      dialogOpen: [isDiscardDialogOpen, setIsDiscardDialogOpen],
      slugConfirmation: [discardSlugConfirmation, setDiscardSlugConfirmation],
      errorMessage: [discardErrorText, setDiscardErrorText],
      isConfirming: discardMutation.isPending, onConfirm: () => discardMutation.mutate(),
    }),
  };
}
