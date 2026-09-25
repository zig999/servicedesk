import { useEffect, type BaseSyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import { apiFetch } from "../services/api-client";
import type { CaseVersionFormValues } from "../services/case-version-form-schema";
import type { CaseVersionRecord } from "../services/case-version-record";
import { useGlossaryVocabularyOptions } from "./use-glossary-vocabulary";
import { useCaseVersions } from "./use-case-versions";
import {
  resetFormFrom,
  type EditDraftVersionFormState,
  type SaveStatus,
} from "./use-edit-draft-version-form";

export function useNotValidDraftVersionState(
  slug: string,
  version: number | null,
  isNotValid: boolean,
  form: UseFormReturn<CaseVersionFormValues>,
  status: SaveStatus,
  setStatus: (status: SaveStatus) => void,
  onCancel: () => void,
  retryVersionQuery: () => void,
  onSubmit: (event?: BaseSyntheticEvent) => void,
  onFieldBlur: () => void,
): EditDraftVersionFormState | null {
  const versionsQuery = useCaseVersions(slug);
  const notValidVersionState = versionsQuery.data?.data.find(
    (item) => item.version === version,
  )?.state;

  const outcomeOptions = useGlossaryVocabularyOptions("outcome");
  const actionOptions = useGlossaryVocabularyOptions("action");
  const recipientOptions = useGlossaryVocabularyOptions("recipient");
  const isLoadingGlossary =
    outcomeOptions.isLoading || actionOptions.isLoading || recipientOptions.isLoading;
  const isGlossaryError =
    outcomeOptions.isError || actionOptions.isError || recipientOptions.isError;

  const declaredAttributesQuery = useQuery({
    queryKey: ["case-version-declared-attributes", slug, version],
    queryFn: () =>
      apiFetch<CaseVersionRecord>(
        `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/declared-attributes`,
      ),
    enabled: version !== null && isNotValid && notValidVersionState === "draft",
  });

  useEffect(() => {
    if (declaredAttributesQuery.data) {
      resetFormFrom(form, declaredAttributesQuery.data);
      setStatus("clean");
    }
  }, [declaredAttributesQuery.data]);

  if (!isNotValid) {
    return null;
  }
  if (versionsQuery.isError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void versionsQuery.refetch();
        retryVersionQuery();
      },
    };
  }
  if (!versionsQuery.data) {
    return { phase: "loading" };
  }
  if (notValidVersionState !== "draft") {
    return { phase: "not-valid" };
  }
  if (declaredAttributesQuery.isError || isGlossaryError) {
    return {
      phase: "load-error",
      retryLoad: () => {
        void declaredAttributesQuery.refetch();
        outcomeOptions.refetch();
        actionOptions.refetch();
        recipientOptions.refetch();
      },
    };
  }
  if (declaredAttributesQuery.isLoading || isLoadingGlossary || !declaredAttributesQuery.data) {
    return { phase: "loading" };
  }

  return {
    phase: "not-valid",
    form,
    status,
    isBlocked: status === "saving" || status === "conflict",
    outcomeOptions,
    actionOptions,
    recipientOptions,
    onSubmit,
    onFieldBlur,
    onCancel,
  };
}
