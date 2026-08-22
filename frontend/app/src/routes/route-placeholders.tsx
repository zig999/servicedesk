import type { JSX } from "react";

/**
 * One placeholder component per proposal screen (2.1 through 2.10), wired to
 * the route tree in ./route-tree. Each renders only its own identifying text
 * -- no layout, no AppShell -- per this task's own criteria; the AppShell
 * task composes every one of these behind a persistent shell later.
 */

export function CasesListPlaceholder(): JSX.Element {
  return <p>Cases List placeholder</p>;
}

export function CaseDetailPlaceholder(): JSX.Element {
  return <p>Case Detail placeholder</p>;
}

// Left in place, unused, the same way CasesListPlaceholder and
// CaseDetailPlaceholder above already were once their own routes moved to a
// real screen (Onda 2) -- this file's own established precedent for this
// exact kind of change, rather than a cleanup this task's own scope reaches
// for on its own.
export function CaseVersionPlaceholder(): JSX.Element {
  return <p>Case Version placeholder</p>;
}

export function VersionManifestPlaceholder(): JSX.Element {
  return <p>Version Manifest placeholder</p>;
}

export function ManifestHypothesisPlaceholder(): JSX.Element {
  return <p>Manifest Hypothesis placeholder</p>;
}

export function VersionReleasePlaceholder(): JSX.Element {
  return <p>Version Release placeholder</p>;
}

export function VersionDiscardPlaceholder(): JSX.Element {
  return <p>Version Discard placeholder</p>;
}

export function GlossaryPlaceholder(): JSX.Element {
  return <p>Glossary placeholder</p>;
}

export function CapabilitiesPlaceholder(): JSX.Element {
  return <p>Capabilities placeholder</p>;
}

export function CaseHypothesesPlaceholder(): JSX.Element {
  return <p>Case Hypotheses placeholder</p>;
}
