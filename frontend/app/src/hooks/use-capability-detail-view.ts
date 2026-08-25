/**
 * Adds the two behaviors the routed capability detail screen needs on top
 * of useCapabilityDetail.ts's own data layer
 * (task/connector-capability-detail-editing/capability-detail-hook, already
 * delivered): a discard-changes control
 * (task/connector-capability-detail-editing/capability-detail-route's own
 * criterion 5) and a success acknowledgement once a save actually lands
 * (criterion 7). Composed over that hook rather than folded into it, so its
 * own already-delivered phase/dirty/save-baseline contract stays exactly
 * what it is (that file's own header comment: "that screen itself is a
 * later, separate task ... this file only exposes the data layer it will
 * consume") -- this module is that later task's own extra layer, not a
 * second, competing data layer, and it is never itself the read/write
 * boundary to the network (must_not_duplicate: the loading/load-error/ready
 * phase shape, the dirty tracking and the reset-on-load/reset-on-save
 * convention all stay exactly useCapabilityDetail's own). Mirrors
 * use-connector-configuration-detail-view.ts's own composition-hook pattern
 * exactly, per this task's own instruction to mirror it closely -- adapted
 * for two JSON fields (input_schema, output_schema) instead of that
 * sibling's one (configuration), and for a react-hook-form portion of the
 * form that carries more than the bare identity (nature, timeout,
 * connector, concept, alongside the disabled name/version identity).
 *
 * Discard (criterion 5) needs nothing the hook this file wraps did not
 * already expose at this task's first delivery: its own "ready" phase
 * carries `{ form, inputSchema, outputSchema, isDirty, isSubmitting,
 * onSubmit, ... }` (read in full before writing this file), with no
 * baseline value and no refetch -- by that hook's own design, its internal
 * `inputSchemaBaseline`/`outputSchemaBaseline` are closed over privately and
 * re-seeded by its own load effect and its own mutation's `onSuccess`, never
 * returned. So discard is derived entirely from what that phase already
 * exposes, observed from outside it, rather than by widening that hook's
 * own return shape:
 *
 * - `inputSchema.value`/`outputSchema.value` already equal exactly the most
 *   recently loaded-or-saved schema text every time `isDirty` reads false
 *   (immediately after a load, immediately after a successful save, and any
 *   other moment an edit happens to return either field to that same
 *   value) -- the same fact useCapabilityDetail.ts's own header comment
 *   states its internal baselines hold, since `isDirty` there is computed
 *   as a comparison against exactly those two baselines.
 *   `inputSchemaBaselineRef`/`outputSchemaBaselineRef` below snapshot
 *   exactly those two values every time `isDirty` reads false, and discard
 *   plays them back through each field's own `onChange`.
 * - Unlike useConnectorConfigurationDetail.ts's own react-hook-form portion
 *   (which carries only the disabled identity field, `connector`, so
 *   resetting it to the route's own path param is exactly the reset a
 *   snapshot would have produced), this hook's own form carries four
 *   editable fields alongside the disabled `name`/`version` identity:
 *   `nature`, `timeout`, `connector` and `concept`. A snapshot of those four
 *   would duplicate react-hook-form's own internal bookkeeping, which
 *   already holds exactly the baseline discard needs as its own
 *   `defaultValues` -- both useCapabilityDetail.ts's own load effect and its
 *   own mutation's `onSuccess` call `form.reset(...)` with the full loaded
 *   or just-submitted values, which react-hook-form's own `reset` sets as
 *   the new `defaultValues` a later, argument-less `form.reset()` call
 *   resets back to (react-hook-form's own documented behavior: reset with
 *   no arguments resets every field to the last-set `defaultValues`, not to
 *   empty). So `detail.form.reset()` below is this task's own inference,
 *   disclosed here: no criterion or node states which reset call restores a
 *   multi-field form, and this is the one that reuses that hook's own
 *   already-correct defaultValues bookkeeping rather than a second,
 *   hand-copied snapshot of every editable field.
 *
 * The success acknowledgement (criterion 7) is derived from
 * `isSubmitSuccessful`'s own false-to-true transition -- react-query's own
 * mutation status, added to use-capability-detail.ts by this same task
 * (disclosed as this task's own divergence there, mirroring the sibling
 * connector-configuration-detail-route task's own identical widening of
 * useConnectorConfigurationDetail.ts, and for the identical reason: a
 * failed PUT never reaches it, since its own `onSuccess` never runs, so its
 * own baseline never moves and `isDirty` stays true -- no pairing with
 * `isDirty` is needed to tell a successful save apart from a failed one).
 * `wasSubmitSuccessfulRef` below tracks the previously observed value so the
 * transition, not the level, is what sets `justSaved`; without it, a save
 * that already succeeded would re-flag itself on every later render where
 * `isDirty` happens to read false again (e.g. an edit reverted back to the
 * same value) even though no new save occurred. `justSaved` is still
 * cleared the moment the operator edits again (`isDirty` turning true), so
 * it never outlives the values it was acknowledging.
 */

import { useEffect, useRef, useState } from "react";
import { useCapabilityDetail, type CapabilityDetailState } from "./use-capability-detail";

export type CapabilityDetailViewState =
  | Extract<CapabilityDetailState, { phase: "loading" | "load-error" }>
  | (Extract<CapabilityDetailState, { phase: "ready" }> & {
      /**
       * Resets `form` (nature, timeout, connector, concept, alongside the
       * disabled name/version identity) and both JSON schema fields back to
       * the most recently loaded-or-saved values, and re-disables Save
       * (criterion 5).
       */
      readonly onDiscard: () => void;
      /**
       * True from the instant a save succeeds until the next edit
       * (criterion 7) -- never true on load, and never true after a failed
       * save.
       */
      readonly justSaved: boolean;
    });

/**
 * `name` and `version` together are the record's own identity, read by the
 * caller from the route's own path params and passed straight through to
 * useCapabilityDetail below (that hook's own header comment).
 */
export function useCapabilityDetailView(
  name: string,
  version: string,
): CapabilityDetailViewState {
  const detail = useCapabilityDetail(name, version);
  const isReady = detail.phase === "ready";

  const inputSchemaBaselineRef = useRef({ value: "", isValid: true });
  const outputSchemaBaselineRef = useRef({ value: "", isValid: true });
  // Tracks the previously observed `isSubmitSuccessful` value so `justSaved`
  // is set on its false-to-true transition, not on its level -- see this
  // file's own header comment.
  const wasSubmitSuccessfulRef = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentIsDirty = isReady ? detail.isDirty : null;
  const currentInputSchemaValue = isReady ? detail.inputSchema.value : null;
  const currentInputSchemaValid = isReady ? detail.inputSchema.isValid : null;
  const currentOutputSchemaValue = isReady ? detail.outputSchema.value : null;
  const currentOutputSchemaValid = isReady ? detail.outputSchema.isValid : null;
  const currentIsSubmitSuccessful = isReady ? detail.isSubmitSuccessful : null;

  // Snapshots the baseline discard plays back, every time the ready phase
  // reports no outstanding edit -- see this file's own header comment.
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

  // Flags a save that just landed (criterion 7), derived from
  // isSubmitSuccessful's own false-to-true transition -- see this file's own
  // header comment for why a comparison over isSubmitting across renders
  // does not. Clears the instant a fresh edit makes the acknowledgement
  // stale.
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
      // Resets nature/timeout/connector/concept (and the disabled
      // name/version identity) back to react-hook-form's own defaultValues,
      // which useCapabilityDetail.ts's own load effect and its own
      // mutation's onSuccess already keep at exactly the loaded-or-saved
      // baseline -- see this file's own header comment.
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
