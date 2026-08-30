import type { JSX } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { UseFormReturn } from "react-hook-form";
import { useConnectorConfigurationForm } from "../hooks/use-connector-configuration-form";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import { ConnectorConfigurationFormFields } from "./connector-configuration-form-fields";

/**
 * The routed connector-configuration create screen
 * (task/connector-capability-create-detail-route/
 * connector-configuration-create-route): the whole of what the popup
 * Dialog's create mode (connector-configuration-form-dialog.tsx's own
 * `target.mode === "create"` branch) offered, laid out as its own full page
 * at route-tree.tsx's own "/connectors/new" instead.
 *
 * Composes useConnectorConfigurationForm(null, onSaved) -- the same shared
 * create/edit hook connector-configuration-form-dialog.tsx already opens in
 * create mode, opened in create mode here too, rather than a second hook
 * re-deriving that state (this task's own criterion, and the inventory's
 * own must_not_duplicate entry for this hook's create(null)/edit(existing)
 * shape). Its `connector` field is left enabled (`isEditingIdentity` is
 * `state.isEditingIdentity`, which reads `false` for `existing === null`),
 * unlike the routed detail screen's own always-`true` literal -- criterion
 * 3 of this task.
 *
 * ConnectorConfigurationFormFields (criterion 4) is composed exactly as
 * both connector-configuration-form-dialog.tsx and
 * connector-configuration-detail-ready-view.tsx already compose it --
 * `form`, `configuration`, `isEditingIdentity`, `isSubmitting`, `onSubmit`
 * unchanged. `trailingActions` is left unset: this screen tracks no
 * "differs from a loaded baseline" concept the way the routed detail
 * screen's own Discard action needs (there is nothing loaded to discard
 * back to in create mode), and `isDirty` is left unset for the same reason
 * -- ConnectorConfigurationFormFieldsProps' own header comment on why
 * leaving it unset never itself disables Save.
 *
 * No ConnectorTestPanel is rendered here (criterion 13) -- the same
 * "never rendered in create mode" this task's own Notes record the popup
 * Dialog's create branch already keeps: a connector configuration nothing
 * yet references has no registered capability that could test it yet
 * (rules/integration/a-connector-configuration-is-tested-through-a-
 * registered-capability).
 *
 * On success, `handleSaved` reads the just-registered connector's own name
 * back off the form (`formRef.current.getValues("connector")`) and
 * navigates to that connector's own detail route (criterion 11) rather than
 * leaving the operator on this create route -- the same detail route a
 * subsequent edit of that record already uses (this task's own Notes).
 * `formRef` exists only to break the ordering cycle this needs: `onSaved`
 * must be handed to useConnectorConfigurationForm before that call returns
 * the `form` object `onSaved` reads from, so the ref is populated
 * immediately after the hook call on every render and `handleSaved` (which
 * only ever runs later, from useConnectorConfigurationForm's own mutation
 * onSuccess, after at least one render has populated it) always reads
 * through it rather than closing over a stale `state` from an earlier
 * render. react-hook-form's own `form` object is stable across renders (the
 * same instance for the lifetime of the component), so `getValues` here
 * always answers with whatever was actually submitted, not a snapshot razed
 * by any later reset.
 *
 * A registration the registry refuses is not handled here at all --
 * useConnectorConfigurationForm's own `onError` already reaches the
 * operator through `toast.error(saveFailureMessage(error))`, the shared
 * hook's own distinguishable failure message (criterion 10); this screen
 * neither re-catches nor re-derives that message, so it is never at risk of
 * swallowing it.
 *
 * A "Back to connector configurations" Link (criterion 12) mirrors
 * connector-configuration-detail-screen.tsx's own placement, rendered
 * unconditionally since this screen has no loading or load-error phase of
 * its own to gate it behind (unlike that routed detail screen, this one
 * issues no GET on mount -- useConnectorConfigurationForm needs none for
 * `existing === null`).
 *
 * Wired in as route-tree.tsx's own "/connectors/new" route's `component`
 * (criterion 1), a static sibling segment ranking over the existing dynamic
 * "/connectors/$connector" route (criterion 2) the same way that file's own
 * newCaseVersionRoute and newManifestHypothesisRoute already establish.
 */
export function ConnectorConfigurationCreateScreen(): JSX.Element {
  const navigate = useNavigate();
  const formRef = useRef<UseFormReturn<ConnectorConfigurationFormValues> | null>(null);

  function handleSaved(): void {
    const connector = formRef.current?.getValues("connector") ?? "";
    void navigate({ to: "/connectors/$connector", params: { connector } });
  }

  const state = useConnectorConfigurationForm(null, handleSaved);
  formRef.current = state.form;

  return (
    <section className="flex flex-col gap-4">
      <Link to="/connectors">Back to connector configurations</Link>
      <h1 className="text-lg font-semibold text-foreground">New connector configuration</h1>
      <ConnectorConfigurationFormFields
        form={state.form}
        configuration={state.configuration}
        isEditingIdentity={state.isEditingIdentity}
        isSubmitting={state.isSubmitting}
        onSubmit={state.onSubmit}
      />
    </section>
  );
}
