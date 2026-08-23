import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  useCaseAttributesAtAGlance,
  type CaseAttributesAtAGlanceState,
} from "../hooks/use-case-attributes-at-a-glance";
import type { CaseVersionState } from "../hooks/use-case-versions";
import type { CaseVersionRecord } from "../services/case-version-record";

/**
 * Case Detail's third tab, "Attributes at a glance"
 * (task/cases-list-and-detail/case-attributes-at-a-glance): surfaces the
 * case's current version's own declared attributes -- title, when_to_use,
 * subject, fallback outcome/referral and consolidation_register (criterion
 * 1, domain/knowledge/case-version's own declared attributes; fallback is
 * domain/knowledge/resolution, pairing an outcome with a referral
 * (domain/knowledge/referral); consolidation_register is domain/knowledge/
 * consolidation-register) -- plus the one action matching whichever state
 * that version stands in (criteria 3 and 4).
 *
 * All business logic (resolving "the current version", reading it whole,
 * and the explicit-refusal branch) lives in useCaseAttributesAtAGlance
 * (ARC-03); this component only renders whatever phase that hook returns.
 *
 * Deliberately does not reuse CaseVersionEditorFormFields (the Version
 * Editor's own shared, react-hook-form-bound field markup,
 * must_not_duplicate at case-version-editor-form-fields.tsx): that markup is
 * built for an editable form against one glossary-backed Select per
 * field and a Save button, none of which any criterion of this task asks
 * for -- this view is a plain, read-only surfacing of values already
 * validated and returned by read-case, not a second edit surface. Reusing
 * it here would mount a <form> and a Save control this task's own
 * objective ("at a glance") does not call for -- exactly the risk the
 * inventory raises against a different, sibling task
 * (task/version-editor/view-released-version-read-only) that read-only
 * render is left to answer instead, on its own schedule.
 *
 * Composed by case-detail-screen.tsx's own "Attributes" TabsContent; this
 * component owns no tab chrome of its own (matching case-hypotheses-tab.tsx).
 */

export type CaseAttributesTabProps = {
  readonly slug: string;
};

/** One labeled value, the read-only equivalent of case-version-editor-form-fields.tsx's own FormField wrapper -- a caption above its own value, no control. */
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

/**
 * Renders the current version's own declared attributes (criterion 1).
 * consolidation_register is optional (case-version-record.ts's own header
 * comment: absent for a version whose curator never set one) -- "Not set"
 * mirrors CaseVersionEditorFormFields's own Select placeholder for the same
 * field, not a new domain wording of its own.
 */
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

/**
 * The one action matching whichever state the current version stands in
 * (criteria 3 and 4): a draft offers "Continue editing", navigating to that
 * draft's own route with no additional request first (the same client-side
 * Link convention case-detail-screen.tsx's own Versions tab already
 * establishes); a released version offers both a read link to its own
 * read-only route ("View released vX") and a write action originating the
 * next draft from it ("New draft from vX", addressed by that same version's
 * own number through the "sourceVersion" search param route-tree.tsx now
 * declares on the New Draft route) -- this task's own rationale on why both
 * render together rather than one being chosen over the other.
 */
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
      // Mirrors case-detail-screen.tsx's own Versions-tab wording for the
      // exact same fact (a case currently holding no version) -- this task's
      // own Notes deliberately does not introduce a new closure of
      // scenarios/knowledge/a-case-holding-no-versions-is-told-explicitly;
      // this reuses the sentence that scenario already earned elsewhere on
      // this same screen rather than leaving this tab loading indefinitely
      // (API-04, EDG-02).
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
