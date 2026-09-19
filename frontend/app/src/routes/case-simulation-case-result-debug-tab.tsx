import type { JSX } from "react";
import { CaseSimulationDetailPromptTab } from "./case-simulation-detail-prompt-tab";
import type {
  CaseResultConsolidationCall,
  SimulationConsolidationRegister,
} from "./case-simulation-case-result-types";

export type CaseSimulationCaseResultDebugTabProps = {
  readonly consolidationCall: CaseResultConsolidationCall;
  readonly register: SimulationConsolidationRegister;
};

const NOT_CALLED_MESSAGE = "The consolidation call was never made for this run.";

export function CaseSimulationCaseResultDebugTab({
  consolidationCall,
  register,
}: CaseSimulationCaseResultDebugTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {consolidationCall.called && (
        <p className="text-sm text-muted-foreground">
          Register {register} · {consolidationCall.usage.inputTokens} tokens in /{" "}
          {consolidationCall.usage.outputTokens} tokens out · {consolidationCall.elapsedMs} ms
        </p>
      )}
      <CaseSimulationDetailPromptTab
        judgmentCall={consolidationCall}
        notCalledMessage={NOT_CALLED_MESSAGE}
      />
    </div>
  );
}
