import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useEditDraftVersionForm } from "../hooks/use-edit-draft-version-form";
import { CaseVersionEditorReadyView } from "./case-version-editor-ready-view";

/**
 * The Version Editor, over an existing draft (task/version-editor/
 * edit-draft-version): loads the named version through GET /v1/cases/
 * {slug}/versions/{version}, pre-populates the field form, and saves through
 * PATCH on blur or the Save button (contracts/knowledge/case-lifecycle's own
 * update-draft operation). Composes the loading/error states this route
 * itself owns (EDG-01, EDG-02) and delegates the "ready" phase's own markup
 * to CaseVersionEditorReadyView (factored out for task/version-editor/
 * new-draft-creation's own screen to reuse once it switches into this same
 * edit-mode flow), and all business logic -- the load, the three glossary
 * reads and the save state machine -- to useEditDraftVersionForm
 * (ARC-02, ARC-03).
 *
 * Wired in as route-tree.tsx's "/cases/$slug/versions/$version" route's own
 * `component`, replacing CaseVersionPlaceholder.
 */
export function CaseVersionEditorScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version",
  });
  const state = useEditDraftVersionForm(slug, Number(version));

  if (state.phase === "loading") {
    return <p>Loading version {version}…</p>;
  }

  if (state.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this version right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <section>
      <h1>
        Case {slug} — Version {version}
      </h1>
      <CaseVersionEditorReadyView state={state} slug={slug} />
    </section>
  );
}
