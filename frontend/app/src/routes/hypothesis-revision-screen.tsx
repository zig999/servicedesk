import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { useHypothesisRevisionForm } from "../hooks/use-hypothesis-revision-form";
import { HypothesisRevisionFormFields } from "./hypothesis-revision-form-fields";

/**
 * The shared Revise/New-hypothesis form (task/manifest-hypothesis-authoring/
 * revise-hypothesis-form): composes the loading/error/success states this
 * screen owns (EDG-01, EDG-02) and delegates the "ready" phase's own field
 * markup to HypothesisRevisionFormFields, and all business logic -- the
 * loads, the concept/glossary reads, the client-side pre-checks and the
 * POST -- to useHypothesisRevisionForm (ARC-02, ARC-03).
 *
 * Composed by both NewHypothesisScreen and ReviseHypothesisScreen
 * (this task's own criterion 1: two distinct routes, one shared form), the
 * same screen/route split case-version-editor-screen.tsx and
 * new-case-draft-screen.tsx already establish for the Version Editor's own
 * two entry points.
 */
export type HypothesisRevisionScreenProps = {
  readonly slug: string;
  readonly version: number;
  /** null on the New-hypothesis route (criterion 2); the addressed hypothesis's own name on the Revise route (criterion 3). */
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
    // Criterion 10: a 201 renders the returned hypothesis_name and revision,
    // and offers a control that navigates to the Manifest Builder for the
    // current draft version.
    return (
      <section>
        <p>
          Hypothesis &quot;{state.hypothesisName}&quot; saved as revision {state.revision}.
        </p>
        <Button type="button" onClick={state.onOpenManifestBuilder}>
          Open Manifest Builder
        </Button>
      </section>
    );
  }

  return (
    <section>
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
