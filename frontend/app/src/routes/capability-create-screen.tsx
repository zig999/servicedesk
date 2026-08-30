import type { JSX } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@tui/ui/button";
import { useCapabilityForm } from "../hooks/use-capability-form";
import type { CapabilityFormValues } from "../services/capability-form-schema";
import { CapabilityFormFields } from "./capability-form-fields";

/**
 * The routed capability create screen
 * (task/connector-capability-create-detail-route/capability-create-route):
 * the whole of what the popup Dialog's create mode
 * (capability-form-dialog.tsx's own `target.mode === "create"` branch)
 * offered, laid out as its own full page at route-tree.tsx's own
 * "/capabilities/new" instead -- one path segment, so it never resolves to
 * the same URL as the existing two-segment
 * "/capabilities/$name/$version" detail route (this task's own Notes,
 * criterion 2).
 *
 * Composes useCapabilityForm(null, onSaved) -- the same shared create/edit
 * hook capability-form-dialog.tsx already opens in create mode, opened in
 * create mode here too, rather than a second hook re-deriving that state
 * (criterion 5, and the inventory's own must_not_duplicate entry for this
 * hook's create(null)/edit(existing) shape). The hook's own "loading" and
 * "load-error" phases (criteria 6, 7 -- the concept vocabulary read
 * use-concept-options.ts backs) are rendered exactly as
 * capability-form-dialog.tsx already renders them, before the "ready" phase
 * composes CapabilityFormFields.
 *
 * In the "ready" phase, `isEditingIdentity` reads `state.isEditingIdentity`
 * (`existing !== null`), which is `false` for `existing === null` -- both
 * `name` and `version` render enabled rather than disabled (criterion 3),
 * unlike the routed detail screen's own always-`true` literal.
 * CapabilityFormFields (criterion 4) is composed exactly as both
 * capability-form-dialog.tsx and capability-detail-ready-view.tsx already
 * compose it -- `form`, `conceptOptions`, `inputSchema`, `outputSchema`,
 * `isEditingIdentity`, `isSubmitting`, `onSubmit` unchanged. `trailingActions`
 * and `isDirty` are left unset, the same reasoning
 * connector-configuration-create-screen.tsx's own header comment states for
 * its own sibling screen: this screen tracks no "differs from a loaded
 * baseline" concept the way the routed detail screen's own Discard action
 * needs, and CapabilityFormFieldsProps' own header comment states that
 * leaving `isDirty` unset never itself disables Save.
 *
 * Neither this screen nor useCapabilityForm itself refuses a concept before
 * dispatching the registration (criterion 11) -- the hook's own submit gate
 * blocks only on an invalid JSON schema (criterion 9), and a concept another
 * capability already answers is left to the registry's own HTTP 409
 * ConceptAlreadyAnsweredError refusal, which the hook's own
 * SAVE_FAILURE_MESSAGE_BY_KIND already maps to a distinguishable message
 * through `toast.error` in its `onError` -- never re-caught or re-derived
 * here, so this screen is never at risk of swallowing it (criterion 10:
 * that refusal leaves the operator on this create screen, since `onSaved`
 * -- and therefore this screen's own navigation away -- only ever runs from
 * the mutation's `onSuccess`).
 *
 * On success, `handleSaved` reads the just-registered capability's own name
 * and version back off the form (`formRef.current.getValues(...)`) and
 * navigates to that capability's own detail route (criterion 12) rather than
 * leaving the operator on this create route -- the same detail route a
 * subsequent edit of that record already uses (this task's own Notes).
 * `formRef` exists only to break the ordering cycle this needs: `onSaved`
 * must be handed to useCapabilityForm before that call can return the `form`
 * object `onSaved` reads from, so the ref is populated from the "ready"
 * phase's own `form` on every render where one is available, and
 * `handleSaved` (which only ever runs later, from useCapabilityForm's own
 * mutation onSuccess, after at least one "ready" render has populated it --
 * Save is unreachable before the "ready" phase renders at all) always reads
 * through it rather than closing over a stale phase from an earlier render.
 * react-hook-form's own `form` object is stable across renders (the same
 * instance for the lifetime of the component) once the "ready" phase is
 * reached, so `getValues` here always answers with whatever was actually
 * submitted.
 *
 * A "Back to capabilities" Link (criterion 13) renders in every phase, the
 * same convention capability-detail-screen.tsx already keeps for its own
 * loading and load-error phases -- an operator who lands on the
 * concept-vocabulary load-error phase still needs a way back to the list.
 *
 * Wired in as route-tree.tsx's own "/capabilities/new" route's `component`
 * (criterion 1), a static sibling segment ranking over the existing dynamic
 * "/capabilities/$name/$version" route regardless of declaration order
 * (TanStack Router sorts a route tree by specificity, not by registration
 * order), the same convention that file's own newCaseVersionRoute,
 * newManifestHypothesisRoute and connectorConfigurationCreateRoute already
 * establish.
 */
export function CapabilityCreateScreen(): JSX.Element {
  const navigate = useNavigate();
  const formRef = useRef<UseFormReturn<CapabilityFormValues> | null>(null);

  function handleSaved(): void {
    const values = formRef.current?.getValues();
    const name = values?.name ?? "";
    const version = values?.version ?? "";
    void navigate({ to: "/capabilities/$name/$version", params: { name, version } });
  }

  const state = useCapabilityForm(null, handleSaved);
  if (state.phase === "ready") {
    formRef.current = state.form;
  }

  return (
    <section className="flex flex-col gap-4">
      <Link to="/capabilities">Back to capabilities</Link>
      <h1 className="text-lg font-semibold text-foreground">New capability</h1>
      {state.phase === "loading" && <p>Loading…</p>}
      {state.phase === "load-error" && (
        <section>
          <p>Unable to load concepts.</p>
          <Button type="button" onClick={state.retryLoad}>
            Retry
          </Button>
        </section>
      )}
      {state.phase === "ready" && (
        <CapabilityFormFields
          form={state.form}
          conceptOptions={state.conceptOptions}
          inputSchema={state.inputSchema}
          outputSchema={state.outputSchema}
          isEditingIdentity={state.isEditingIdentity}
          isSubmitting={state.isSubmitting}
          onSubmit={state.onSubmit}
        />
      )}
    </section>
  );
}
