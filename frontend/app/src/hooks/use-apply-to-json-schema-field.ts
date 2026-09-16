import { useMemo, useState } from "react";
import {
  computeApplyConfirmationDiff,
  type ApplyConfirmationDiff,
} from "../services/connector-configuration-apply-diff";
import type { JsonSchemaFieldState } from "./use-capability-form";

export type ApplyToJsonSchemaFieldState = {
  readonly onApply: (text: string) => void;
  readonly applyConfirmationDiff: ApplyConfirmationDiff | null;
  readonly onApplyConfirmationOpenChange: (open: boolean) => void;
  readonly onConfirmApply: () => void;
};

export function useApplyToJsonSchemaField(
  field: JsonSchemaFieldState,
  hasUnsavedEdit: boolean,
): ApplyToJsonSchemaFieldState {
  const [pendingApplyText, setPendingApplyText] = useState<string | null>(null);

  const applyConfirmationDiff = useMemo<ApplyConfirmationDiff | null>(
    () =>
      pendingApplyText === null
        ? null
        : computeApplyConfirmationDiff(field.value, pendingApplyText),
    [field.value, pendingApplyText],
  );

  function onApply(text: string): void {
    if (!hasUnsavedEdit) {
      field.onChange(text, true);
      return;
    }
    setPendingApplyText(text);
  }

  function onApplyConfirmationOpenChange(open: boolean): void {
    if (!open) {
      setPendingApplyText(null);
    }
  }

  function onConfirmApply(): void {
    if (pendingApplyText !== null) {
      field.onChange(pendingApplyText, true);
    }
    setPendingApplyText(null);
  }

  return {
    onApply,
    applyConfirmationDiff,
    onApplyConfirmationOpenChange,
    onConfirmApply,
  };
}
