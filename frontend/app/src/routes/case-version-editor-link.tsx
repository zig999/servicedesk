import type { JSX } from "react";
import { Link } from "@tanstack/react-router";

export type CaseVersionEditorLinkProps = {
  readonly slug: string;
  readonly version: string;
};

export function CaseVersionEditorLink({
  slug,
  version,
}: CaseVersionEditorLinkProps): JSX.Element {
  return (
    <Link to="/cases/$slug/versions/$version" params={{ slug, version }}>
      Edit version
    </Link>
  );
}
