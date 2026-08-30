/**
 * Adds the two behaviors the routed connector-configuration detail screen
 * needs on top of useConnectorConfigurationDetail.ts's own data layer
 * (task/connector-capability-detail-editing/connector-configuration-detail-hook,
 * already delivered): a discard-changes control
 * (task/connector-capability-detail-editing/connector-configuration-detail-route's
 * own criterion 5) and a success acknowledgement once a save actually
 * lands (criterion 7). Composed over that hook rather than folded into it,
 * so its own already-delivered phase/dirty/save-baseline contract stays
 * exactly what it is (that file's own header comment: "that screen itself
 * is a later, separate task ... this file only exposes the data layer it
 * will consume") -- this module is that later task's own extra layer, not
 * a second, competing data layer, and it is never itself the read/write
 * boundary to the network (must_not_duplicate: the loading/load-error/
 * ready phase shape, the dirty tracking and the reset-on-load/
 * reset-on-save convention all stay exactly useConnectorConfigurationDetail's
 * own).
 *
 * Discard (criterion 5) needs nothing the hook this file wraps did not
 * already expose at this task's first delivery: its own "ready" phase
 * carries `{ form, configuration, isDirty, isSubmitting, onSubmit }` (read
 * in full before writing this file), with no baseline value and no
 * refetch -- by that hook's own design, its internal
 * `configurationBaseline` is closed over privately and re-seeded by its
 * own load effect and its own mutation's `onSuccess`, never returned. So
 * discard is derived entirely from what that phase already exposes,
 * observed from outside it, rather than by widening that hook's own
 * return shape.
 *
 * The success acknowledgement (criterion 7) could not stay that way. It
 * originally derived "a save just landed" by comparing `isSubmitting`
 * across renders through a ref, and a failure-diagnostician found that
 * comparison never fires when a fast-resolving mutation's pending and
 * settled states commit together (the ordinary case for a quick
 * successful PUT, since React then never renders the intermediate
 * `isSubmitting === true` frame the ref needed to catch). Nothing already
 * exposed by that phase can answer "did the last save succeed" from
 * outside it -- `onSubmit` is `void`, not a promise a caller could await
 * -- so the fix widens that hook's own "ready" phase by exactly one field,
 * `isSubmitSuccessful` (react-query's own `mutation.isSuccess`, added to
 * use-connector-configuration-detail.ts by this same corrective delivery;
 * disclosed as this task's own divergence, since that file was delivered
 * by the sibling connector-configuration-detail-hook task). `justSaved`
 * below is now derived from that field's own false-to-true transition
 * instead of from comparing `isSubmitting` across renders, exactly as the
 * diagnosis asked:
 *
 * - Discard (criterion 5) needs the most recently loaded-or-saved
 *   configuration text to reset back to. `configuration.value` already
 *   equals exactly that text every time `isDirty` reads false (immediately
 *   after a load, immediately after a successful save, and any other
 *   moment an edit happens to return the field to that same value) -- the
 *   same fact useConnectorConfigurationDetail.ts's own header comment
 *   states its internal baseline holds, since `isDirty` there is computed
 *   as a comparison against exactly that baseline.
 *   `configurationBaseline` below snapshots exactly that value every
 *   time `isDirty` reads false, and discard plays it back through
 *   `configuration.onChange`. `connector` needs no snapshot of its own:
 *   this route always disables that field (`isEditingIdentity` at the call
 *   site), so `form.reset({ connector })` with the route's own path param
 *   -- never edited, and already the loaded record's own identity
 *   (domain/integration/connector-configuration) -- is exactly the same
 *   reset a snapshot would have produced.
 *
 * - `registeredConfigurationText` (task/connector-test-panel-reads-registered-
 *   configuration/thread-registered-configuration-into-test-panel's own
 *   criterion 1, a corrective increment) exposes that same snapshot on the
 *   "ready" phase itself, distinct from `configuration.value`: that
 *   corrective task found ConnectorConfigurationDetailReadyView had been
 *   passing ConnectorTestPanel the live, unsaved `configuration.value`
 *   instead, so Add attribute reconciled its rows against a draft rather
 *   than against what is actually registered under the connector's own
 *   name (rules/integration/a-connector-configuration-is-tested-through-a-
 *   registered-capability). `configurationBaseline` moved from a `useRef`
 *   to a `useState` for exactly this: onDiscard only ever read it inside an
 *   event handler, where a ref already holds the latest write, but a value
 *   returned from this hook's own "ready" phase is read at render time, and
 *   a ref updated inside an effect does not itself schedule the re-render
 *   that would carry a fresh value to that render -- the corrective task's
 *   own delivery record discloses this choice (this hook's own inference;
 *   STA-03 permits it because this snapshot's own history-dependent value
 *   cannot be computed inline from this render's props or state the way an
 *   ordinary derivation could -- the same reasoning already covers
 *   `justSaved` below, and `configurationBaseline` is the one piece of
 *   memory both fields now read from, not a second, duplicate mirror of
 *   it).
 *
 * - The success acknowledgement (criterion 7) needs to tell "a save just
 *   landed" apart from "nothing has happened yet" or "a save is still in
 *   flight". `isSubmitSuccessful` turning from false to true is exactly
 *   that moment -- react-query's own mutation status, which a failed PUT
 *   never reaches (its own `onSuccess` never runs, so its own baseline
 *   never moves and `isDirty` stays true) -- so no pairing with `isDirty`
 *   is needed to tell a successful save apart from a failed one the way
 *   the old `isSubmitting`-based comparison needed. `wasSubmitSuccessfulRef`
 *   below tracks the previously observed value so the transition, not the
 *   level, is what sets `justSaved`; without it, a save that already
 *   succeeded would re-flag itself on every later render where `isDirty`
 *   happens to read false again (e.g. an edit reverted back to the same
 *   text) even though no new save occurred. `justSaved` is still cleared
 *   the moment the operator edits again (`isDirty` turning true), so it
 *   never outlives the values it was acknowledging.
 */

import { useEffect, useRef, useState } from "react";
import {
  useConnectorConfigurationDetail,
  type ConnectorConfigurationDetailState,
} from "./use-connector-configuration-detail";

export type ConnectorConfigurationDetailViewState =
  | Extract<ConnectorConfigurationDetailState, { phase: "loading" | "load-error" }>
  | (Extract<ConnectorConfigurationDetailState, { phase: "ready" }> & {
      /**
       * Resets `configuration` (and the disabled `connector` field) back
       * to the most recently loaded-or-saved values, and re-disables Save
       * (criterion 5).
       */
      readonly onDiscard: () => void;
      /**
       * True from the instant a save succeeds until the next edit
       * (criterion 7) -- never true on load, and never true after a
       * failed save.
       */
      readonly justSaved: boolean;
      /**
       * The most recently loaded-or-saved configuration text
       * (task/connector-test-panel-reads-registered-configuration/
       * thread-registered-configuration-into-test-panel's own criterion 1)
       * -- the same text `onDiscard` above resets `configuration` back to,
       * re-seeded only at load and at a successful save. Distinct from
       * `configuration.value`, which is the live, possibly-unsaved edit.
       */
      readonly registeredConfigurationText: string;
    });

/**
 * `connector` is the record's own identity, read by the caller from the
 * route's own path param and passed straight through to
 * useConnectorConfigurationDetail below (that hook's own header comment).
 */
export function useConnectorConfigurationDetailView(
  connector: string,
): ConnectorConfigurationDetailViewState {
  const detail = useConnectorConfigurationDetail(connector);
  const isReady = detail.phase === "ready";

  const [configurationBaseline, setConfigurationBaseline] = useState({
    value: "",
    isValid: true,
  });
  // Tracks the previously observed `isSubmitSuccessful` value so `justSaved`
  // is set on its false-to-true transition, not on its level -- see this
  // file's own header comment.
  const wasSubmitSuccessfulRef = useRef(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentIsDirty = isReady ? detail.isDirty : null;
  const currentConfigurationValue = isReady ? detail.configuration.value : null;
  const currentConfigurationValid = isReady ? detail.configuration.isValid : null;
  const currentIsSubmitSuccessful = isReady ? detail.isSubmitSuccessful : null;

  // Snapshots the baseline discard plays back (and registeredConfigurationText
  // below reads), every time the ready phase reports no outstanding edit --
  // see this file's own header comment.
  useEffect(() => {
    if (isReady && currentIsDirty === false) {
      setConfigurationBaseline({
        value: currentConfigurationValue ?? "",
        isValid: currentConfigurationValid ?? true,
      });
    }
  }, [isReady, currentIsDirty, currentConfigurationValue, currentConfigurationValid]);

  // Flags a save that just landed (criterion 7), derived from
  // isSubmitSuccessful's own false-to-true transition rather than from
  // comparing isSubmitting across renders -- see this file's own header
  // comment for why the latter silently never fires for a fast-resolving
  // save. Clears the instant a fresh edit makes the acknowledgement stale.
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
      detail.form.reset({ connector });
      detail.configuration.onChange(configurationBaseline.value, configurationBaseline.isValid);
      setJustSaved(false);
    },
    justSaved,
    registeredConfigurationText: configurationBaseline.value,
  };
}
