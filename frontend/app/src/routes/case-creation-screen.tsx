import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { useCaseCreationForm } from "../hooks/use-case-creation-form";
import { CaseCreationFormFields } from "./case-creation-form-fields";

export function CaseCreationScreen(): JSX.Element {
  const state = useCaseCreationForm();

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">New case</h1>
      {state.phase === "loading" && (
        <>
          <p>Loading…</p>
          <ButtonFooter>
            <Button type="button" variant="secondary" onClick={state.onCancel}>
              Cancel
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/cases">Cases</Link>
            </Button>
          </ButtonFooter>
        </>
      )}
      {state.phase === "load-error" && (
        <section className="flex flex-col gap-4">
          <p>Unable to load this form right now.</p>
          <ButtonFooter>
            <Button type="button" onClick={state.retryLoad}>
              Retry
            </Button>
            <Button type="button" variant="secondary" onClick={state.onCancel}>
              Cancel
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/cases">Cases</Link>
            </Button>
          </ButtonFooter>
        </section>
      )}
      {state.phase === "ready" && (
        <CaseCreationFormFields
          form={state.form}
          outcomeOptions={state.outcomeOptions}
          actionOptions={state.actionOptions}
          recipientOptions={state.recipientOptions}
          stillAbsentFields={state.stillAbsentFields}
          isSubmitting={state.isSubmitting}
          onSubmit={state.onSubmit}
          trailingActions={
            <>
              <Button type="button" variant="secondary" onClick={state.onCancel}>
                Cancel
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/cases">Cases</Link>
              </Button>
            </>
          }
        />
      )}
    </section>
  );
}
