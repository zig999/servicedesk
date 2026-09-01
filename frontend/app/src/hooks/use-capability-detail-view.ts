import { useEffect, useRef, useState } from "react";
import { useCapabilityDetail, type CapabilityDetailState } from "./use-capability-detail";

export type CapabilityDetailViewState =
  | Extract<CapabilityDetailState, { phase: "loading" | "load-error" }>
  | (Extract<CapabilityDetailState, { phase: "ready" }> & {

      readonly onDiscard: () => void;

      readonly justSaved: boolean;
    });

export function useCapabilityDetailView(
  name: string,
  version: string,
): CapabilityDetailViewState {
  const detail = useCapabilityDetail(name, version);
  const isReady = detail.phase === "ready";

  const inputSchemaBaselineRef = useRef({ value: "", isValid: true });
  const outputSchemaBaselineRef = useRef({ value: "", isValid: true });

  const wasSubmitSuccessfulRef = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentIsDirty = isReady ? detail.isDirty : null;
  const currentInputSchemaValue = isReady ? detail.inputSchema.value : null;
  const currentInputSchemaValid = isReady ? detail.inputSchema.isValid : null;
  const currentOutputSchemaValue = isReady ? detail.outputSchema.value : null;
  const currentOutputSchemaValid = isReady ? detail.outputSchema.isValid : null;
  const currentIsSubmitSuccessful = isReady ? detail.isSubmitSuccessful : null;

  useEffect(() => {
    if (isReady && currentIsDirty === false) {
      inputSchemaBaselineRef.current = {
        value: currentInputSchemaValue ?? "",
        isValid: currentInputSchemaValid ?? true,
      };
      outputSchemaBaselineRef.current = {
        value: currentOutputSchemaValue ?? "",
        isValid: currentOutputSchemaValid ?? true,
      };
    }
  }, [
    isReady,
    currentIsDirty,
    currentInputSchemaValue,
    currentInputSchemaValid,
    currentOutputSchemaValue,
    currentOutputSchemaValid,
  ]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const succeeded = currentIsSubmitSuccessful ?? false;
    const dirty = currentIsDirty ?? false;
    if (succeeded && !wasSubmitSuccessfulRef.current) {
      setJustSaved(true);
    } else if (dirty) {
      setJustSaved(false);
    }
    wasSubmitSuccessfulRef.current = succeeded;
  }, [isReady, currentIsSubmitSuccessful, currentIsDirty]);

  if (detail.phase !== "ready") {
    return detail;
  }

  return {
    ...detail,
    onDiscard: () => {

      detail.form.reset();
      const inputBaseline = inputSchemaBaselineRef.current;
      detail.inputSchema.onChange(inputBaseline.value, inputBaseline.isValid);
      const outputBaseline = outputSchemaBaselineRef.current;
      detail.outputSchema.onChange(outputBaseline.value, outputBaseline.isValid);
      setJustSaved(false);
    },
    justSaved,
  };
}
