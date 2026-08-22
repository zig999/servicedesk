import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { HypothesisRevisionScreen } from "./hypothesis-revision-screen";

/**
 * The Revise screen (task/manifest-hypothesis-authoring/
 * revise-hypothesis-form, criterion 3): the shared Revise/New-hypothesis
 * form, pre-populated from the addressed hypothesis's own current revision.
 *
 * Wired in as route-tree.tsx's own "/cases/$slug/versions/$version/manifest/
 * hypotheses/$hypothesisName" route's own `component`, replacing
 * ManifestHypothesisPlaceholder.
 */
export function ReviseHypothesisScreen(): JSX.Element {
  const { slug, version, hypothesisName } = useParams({
    from: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  });
  return (
    <HypothesisRevisionScreen slug={slug} version={Number(version)} hypothesisName={hypothesisName} />
  );
}
