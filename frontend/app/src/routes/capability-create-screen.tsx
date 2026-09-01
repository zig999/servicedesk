import type { JSX } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@tui/ui/button";
import { useCapabilityForm } from "../hooks/use-capability-form";
import type { CapabilityFormValues } from "../services/capability-form-schema";
import { CapabilityFormFields } from "./capability-form-fields";

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
