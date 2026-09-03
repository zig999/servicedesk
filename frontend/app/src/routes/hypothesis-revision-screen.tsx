import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { useHypothesisRevisionForm } from "../hooks/use-hypothesis-revision-form";
import { HypothesisRevisionFormFields } from "./hypothesis-revision-form-fields";

export type HypothesisRevisionScreenProps = {
  readonly slug: string;
  readonly version: number;

  readonly hypothesisName: string | null;
};

export function HypothesisRevisionScreen({
  slug,
  version,
  hypothesisName,
}: HypothesisRevisionScreenProps): JSX.Element {
  const state = useHypothesisRevisionForm(slug, version, hypothesisName);

  if (state.phase === "loading") {
    return <p>Loading…</p>;
  }

  if (state.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this form right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  if (state.phase === "success") {

    return (
      <section>
        <p>
          Hypothesis &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.
        </p>
        {state.offerManifestBuilder && (
          <Button type="button" onClick={state.onOpenManifestBuilder}>
            Open Manifest Builder
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1>{hypothesisName === null ? "New hypothesis" : `Revise hypothesis — ${hypothesisName}`}</h1>
      <HypothesisRevisionFormFields
        form={state.form}
        hypothesisNameEditable={state.hypothesisNameEditable}
        subjectType={state.subjectType}
        collectsOptions={state.collectsOptions}
        outcomeOptions={state.outcomeOptions}
        actionOptions={state.actionOptions}
        recipientOptions={state.recipientOptions}
        isSubmitting={state.isSubmitting}
        onSubmit={state.onSubmit}
      />
    </section>
  );
}
