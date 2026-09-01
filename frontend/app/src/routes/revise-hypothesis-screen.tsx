import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { HypothesisRevisionScreen } from "./hypothesis-revision-screen";

export function ReviseHypothesisScreen(): JSX.Element {
  const { slug, version, hypothesisName } = useParams({
    from: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
  });
  return (
    <HypothesisRevisionScreen slug={slug} version={Number(version)} hypothesisName={hypothesisName} />
  );
}
