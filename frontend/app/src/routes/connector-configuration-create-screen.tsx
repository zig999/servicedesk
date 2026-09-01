import type { JSX } from "react";
import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { UseFormReturn } from "react-hook-form";
import { useConnectorConfigurationForm } from "../hooks/use-connector-configuration-form";
import type { ConnectorConfigurationFormValues } from "../services/connector-configuration-form-schema";
import { ConnectorConfigurationFormFields } from "./connector-configuration-form-fields";

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
