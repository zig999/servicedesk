import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useNewDraftVersionForm } from "../hooks/use-new-draft-version-form";
import { CaseVersionEditorReadyView } from "./case-version-editor-ready-view";

export function NewCaseDraftScreen(): JSX.Element {
  const { slug } = useParams({ from: "/cases/$slug/versions/new" });
  const state = useNewDraftVersionForm(slug);

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

  return (
    <section className="flex flex-col gap-4">
      <h1>Case {slug} — New draft</h1>
      {state.isFirstVersion && <p>This is the case&apos;s first version.</p>}
      <CaseVersionEditorReadyView state={state} slug={slug} />
    </section>
  );
}
