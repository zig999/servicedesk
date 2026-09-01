import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { HypothesisRevisionScreen } from "./hypothesis-revision-screen";

export function NewHypothesisScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version/manifest/hypotheses/new",
  });
  return <HypothesisRevisionScreen slug={slug} version={Number(version)} hypothesisName={null} />;
}
