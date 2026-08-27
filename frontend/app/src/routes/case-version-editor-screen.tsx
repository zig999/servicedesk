import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
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
 * task/simulation-cockpit/simulate-entry-links's own "Simulate" entry
 * control (criterion 1): a plain client-side Link to route-tree.tsx's own
 * "/cases/$slug/versions/$version/simulate" (already registered by
 * task/simulation-cockpit/case-simulation-route), addressed by this same
 * route's own params -- matching the established convention for a
 * navigation action in this area (case-simulation-header.tsx's own "Edit
 * version"/"Manifest" Links, case-detail-screen.tsx's own Versions-tab
 * actions cell, case-attributes-tab.tsx's own CurrentVersionAction): a plain
 * Link, never a Button wrapping one. Rendered once, above the ready-view,
 * unconditionally of the loaded record's own draft/released state -- unlike
 * "Edit version" in the simulation header, nothing about this control
 * differs between the two states, so it needs no state-keyed branch of its
 * own.
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
    <section className="flex flex-col gap-4">
      <h1>
        Case {slug} — Version {version}
      </h1>
      <Link to="/cases/$slug/versions/$version/simulate" params={{ slug, version }}>
        Simulate
      </Link>
      <CaseVersionEditorReadyView state={state} slug={slug} />
    </section>
  );
}
