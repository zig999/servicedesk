import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useEditDraftVersionForm } from "../hooks/use-edit-draft-version-form";
import { CaseVersionEditorReadyView } from "./case-version-editor-ready-view";
import {
  CaseVersionEditorNotValidView,
  isEnrichedNotValidState,
} from "./case-version-editor-not-valid-view";

export function CaseVersionEditorScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version",
  });
  const state = useEditDraftVersionForm(slug, Number(version));

  if (state.phase === "loading") {
    return (
      <section>
        <p>Loading version {version}…</p>
        <Link to="/cases/$slug/versions/$version/manifest" params={{ slug, version }}>
          Manifest
        </Link>
      </section>
    );
  }

  if (state.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this version right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
        <Link to="/cases/$slug/versions/$version/manifest" params={{ slug, version }}>
          Manifest
        </Link>
      </section>
    );
  }

  if (state.phase === "not-valid") {
    if (isEnrichedNotValidState(state)) {
      return (
        <section className="flex flex-col gap-4">
          <Link to="/cases/$slug/versions/$version/manifest" params={{ slug, version }}>
            Manifest
          </Link>
          <CaseVersionEditorNotValidView state={state} slug={slug} />
        </section>
      );
    }

    return (
      <section>
        <p>This case&apos;s current version does not read back as a case.</p>
        <Link to="/cases/$slug/versions/$version/manifest" params={{ slug, version }}>
          Manifest
        </Link>
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
      <Link to="/cases/$slug/versions/$version/manifest" params={{ slug, version }}>
        Manifest
      </Link>
      <CaseVersionEditorReadyView state={state} slug={slug} />
    </section>
  );
}
