import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { HypothesisRevisionScreen } from "./hypothesis-revision-screen";

/**
 * The New-hypothesis origination screen (task/manifest-hypothesis-authoring/
 * revise-hypothesis-form, criterion 2): a blank instance of the shared
 * Revise/New-hypothesis form, its own distinct route so a hypothesis
 * literally named "new" is never captured by it (criterion 1, this task's
 * own rationale).
 *
 * Wired in as route-tree.tsx's own "/cases/$slug/versions/$version/manifest/
 * hypotheses/new" route's own `component` -- a new route this task adds, a
 * static "new" segment ranking over the "$hypothesisName" param segment the
 * same way "/cases/$slug/versions/new" already ranks over
 * "/cases/$slug/versions/$version".
 */
export function NewHypothesisScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version/manifest/hypotheses/new",
  });
  return <HypothesisRevisionScreen slug={slug} version={Number(version)} hypothesisName={null} />;
}
