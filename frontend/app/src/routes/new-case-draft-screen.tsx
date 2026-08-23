import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useNewDraftVersionForm } from "../hooks/use-new-draft-version-form";
import { CaseVersionEditorReadyView } from "./case-version-editor-ready-view";

/**
 * The New Draft origination screen (task/version-editor/new-draft-creation):
 * "clicking New draft on a case with no draft in progress ... lands the
 * curator in that draft's own edit flow" (this task's own objective).
 * Composes the loading/error states this route owns while the blank form's
 * own glossary reads are in flight (EDG-01, EDG-02) and, once a draft is
 * successfully originated, the exact same "ready" markup case-version-
 * editor-screen.tsx renders for an existing draft (CaseVersionEditorReadyView)
 * -- criterion 4's own "switches ... into the same edit-mode flow". All
 * business logic -- the blank form, the POST, and (once created) the same
 * edit-mode save state machine -- lives in useNewDraftVersionForm (ARC-02,
 * ARC-03).
 *
 * task/version-editor/seed-new-draft-from-latest-released's own criterion 2:
 * while the hook's own "ready" state carries `isFirstVersion` (true only
 * while the case holds no released version to pre-populate this form from),
 * this screen states that fact in copy, next to the heading. Reading a flag
 * the hook already computed rather than deriving it here again keeps this
 * decision (what counts as "the case's own latest released version") in one
 * place (ARC-03).
 *
 * Wired in as route-tree.tsx's "/cases/$slug/versions/new" route's own
 * `component` -- a new route this task adds, addressed from Case Detail's
 * own "New draft" action (case-detail-screen.tsx).
 */
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
    <section>
      <h1>Case {slug} — New draft</h1>
      {state.isFirstVersion && <p>This is the case&apos;s first version.</p>}
      <CaseVersionEditorReadyView state={state} slug={slug} />
    </section>
  );
}
