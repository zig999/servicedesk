import type { JSX } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tui/ui/tabs";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import { CaseSimulationDetailEvidenceTab } from "./case-simulation-detail-evidence-tab";
import { CaseSimulationDetailPromptTab } from "./case-simulation-detail-prompt-tab";
import type {
  CaseSimulationDetailPanelProps,
  SimulationVerdict,
} from "./case-simulation-detail-types";

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
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="font-semibold text-foreground">{evaluation.hypothesis}</h3>
          {evaluation.stale && <CaseSimulationStatusDot color="bg-warning" label="Stale" />}
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Verdict</p>
          <CaseSimulationStatusDot {...VERDICT_CELL[evaluation.verdict]} />
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
          <p className="text-sm text-foreground">{hypothesisRevision.criterion}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold text-foreground">Debug</h2>
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
      </div>
    </section>
  );
}
