import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  useCaseAttributesAtAGlance,
  type CaseAttributesAtAGlanceState,
} from "../hooks/use-case-attributes-at-a-glance";
import type { CaseVersionState } from "../hooks/use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

export type CaseAttributesTabProps = {
  readonly slug: string;
};

function AttributeRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function AttributesSummary({ record }: { readonly record: CaseVersionRecord }): JSX.Element {
  return (
    <dl className="flex flex-col gap-3">
      <AttributeRow label="Title" value={record.title} />
      <AttributeRow label="When to use" value={record.when_to_use} />
      <AttributeRow label="Subject" value={record.subject} />
      <AttributeRow label="Fallback outcome" value={record.fallback.outcome} />
      <AttributeRow label="Fallback referral (action)" value={record.fallback.referral.action} />
      <AttributeRow
        label="Fallback referral (recipient)"
        value={record.fallback.referral.recipient}
      />
      <AttributeRow
        label="Consolidation register"
        value={record.consolidation_register ?? "Not set"}
      />
    </dl>
  );
}

function CurrentVersionAction({
  slug,
  version,
  versionState,
}: {
  readonly slug: string;
  readonly version: number;
  readonly versionState: CaseVersionState;
}): JSX.Element {
  if (versionState === "draft") {
    return (
      <Link to="/cases/$slug/versions/$version" params={{ slug, version: String(version) }}>
        Continue editing
      </Link>
    );
  }
  return (
    <div className="flex gap-4">
      <Link to="/cases/$slug/versions/$version" params={{ slug, version: String(version) }}>
        View released v{version}
      </Link>
      <Link
        to="/cases/$slug/versions/new"
        params={{ slug }}
        search={{ sourceVersion: version }}
      >
        New draft from v{version}
      </Link>
    </div>
  );
}

function renderState(
  slug: string,
  state: CaseAttributesAtAGlanceState,
): JSX.Element {
  switch (state.phase) {
    case "loading":
      return <p>Loading…</p>;
    case "no-version":

      return <p>This case currently holds no version.</p>;
    case "load-error":
      return (
        <section>
          <p>Unable to load this case&apos;s current version.</p>
          <Button type="button" onClick={state.retryLoad}>
            Retry
          </Button>
        </section>
      );
    case "case-not-valid":
      return (
        <section>
          {/* criterion 5: distinguishable from the generic load-error above -- this draft's own manifest currently fails read-case's own coherence check (e.g. it holds no hypothesis yet), not a network or server failure. */}
          <p>
            This draft&apos;s currently declared content does not yet read back as a complete
            case.
          </p>
          <Link
            to="/cases/$slug/versions/$version"
            params={{ slug, version: String(state.version) }}
          >
            Continue editing
          </Link>
        </section>
      );
    case "ready":
      return (
        <section className="flex flex-col gap-4">
          <AttributesSummary record={state.record} />
          <CurrentVersionAction slug={slug} version={state.version} versionState={state.versionState} />
        </section>
      );
  }
}

export function CaseAttributesTab({ slug }: CaseAttributesTabProps): JSX.Element {
  const state = useCaseAttributesAtAGlance(slug);
  return renderState(slug, state);
}
