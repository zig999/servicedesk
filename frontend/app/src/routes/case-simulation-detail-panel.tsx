import type { JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tui/ui/tabs";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import { CaseSimulationDetailPromptTab } from "./case-simulation-detail-prompt-tab";
import type {
  CaseSimulationDetailPanelProps,
  SimulationVerdict,
} from "./case-simulation-detail-types";

/**
 * The Detail region (task/simulation-cockpit/detail-panel): opened on
 * selecting a hypothesis row (task/simulation-cockpit/hypotheses-table and
 * task/simulation-cockpit/screen-assembly's own concern -- this component
 * takes that hypothesis's own data as props, per this task's own Notes, and
 * does not read a hook, a query or a route param itself), it shows that
 * hypothesis's verdict and citations (criterion 1) and its revision's own
 * criterion text (criterion 2) always, across three tabs -- Evidence
 * (default, criterion 3), Prompt (criterion 4) and JSON (criterion 5) --
 * built with the same tabs primitive (@tui/ui/tabs) case-detail-screen.tsx
 * and glossary-browser-screen.tsx already compose.
 *
 * Criterion 6 (the judgment's model, prompt version, token usage and
 * elapsed time) renders inside the Evidence tab, beneath the evidence list
 * -- this task's own reference, layout/simulation-screen.md, places the
 * "Judgment ..." summary line there, within its own "Detail" region; no
 * criterion of this task ties it to a specific tab, so this placement is
 * this task's own inference drawn from that reference (a reference decides
 * form, never fact) rather than a criterion the tab choice satisfies on its
 * own.
 *
 * Criterion 7 (composed only into this operator-facing cockpit, never a
 * customer-facing surface) is satisfied by construction: this delivery adds
 * no import of this component into anything, and frontend/app is this
 * project's own curator/operator console in its entirety -- no
 * customer-facing surface exists anywhere in this tree for it to reach.
 * Wiring this component into the simulate route is
 * task/simulation-cockpit/screen-assembly's own job, itself scoped to the
 * same operator-facing app.
 *
 * A `Stale` indicator (rules/investigation/a-simulation-result-is-stale-once-
 * its-source-changes) renders beside the verdict dot when `evaluation.stale`
 * is true, using the same CaseSimulationStatusDot(color="bg-warning",
 * label="Stale") convention case-simulation-case-result-panel.tsx already
 * uses for the Case Result region's own last run -- task/simulation-
 * staleness-binding/mark-hypothesis-evaluations-stale-on-return.
 */

/**
 * Colors for domain/investigation/verdict's own three values -- `confirmed`
 * -> `bg-success`, `refuted` -> `bg-destructive`, `inconclusive` ->
 * `bg-warning`. Not a fact any specification node names a color for -- this
 * task's own inference, following case-detail-screen.tsx's and
 * hypothesis-revision-history.tsx's own established convention for a status
 * cell in this app (see case-simulation-detail-evidence-tab.tsx's own
 * identical inference for evidence-result's four values).
 */
const VERDICT_CELL: Record<SimulationVerdict, { readonly color: string; readonly label: string }> = {
  confirmed: { color: "bg-success", label: "confirmed" },
  refuted: { color: "bg-destructive", label: "refuted" },
  inconclusive: { color: "bg-warning", label: "inconclusive" },
};

export function CaseSimulationDetailPanel({
  hypothesisRevision,
  evaluation,
  evidence,
  rawResponse,
}: CaseSimulationDetailPanelProps): JSX.Element {
  return (
    <section className="flex flex-col gap-4" aria-label={`Detail — ${evaluation.hypothesis}`}>
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="font-semibold text-foreground">{evaluation.hypothesis}</h3>
        <CaseSimulationStatusDot {...VERDICT_CELL[evaluation.verdict]} />
        {evaluation.stale && <CaseSimulationStatusDot color="bg-warning" label="Stale" />}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Citations</p>
        {evaluation.citations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No citations.</p>
        ) : (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {evaluation.citations.map((citation) => (
              <li key={`${citation.concept}.${citation.field}`}>
                {citation.concept}.{citation.field}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Criterion</p>
        <p>{hypothesisRevision.criterion}</p>
      </div>

      <Tabs defaultValue="evidence">
        <TabsList>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="evidence">
          <CaseSimulationDetailEvidenceTab
            collects={hypothesisRevision.collects}
            evidence={evidence}
            judgmentCall={evaluation.judgmentCall}
          />
        </TabsContent>
        <TabsContent value="prompt">
          <CaseSimulationDetailPromptTab judgmentCall={evaluation.judgmentCall} />
        </TabsContent>
        <TabsContent value="json">
          <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </section>
  );
}
