import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Button } from "@tui/ui/button";
import type { ConnectorConfigurationHelperState } from "../hooks/use-connector-configuration-helper";

export type ConnectorConfigurationHelperFieldsProps = {
  readonly state: ConnectorConfigurationHelperState;
};

export function ConnectorConfigurationHelperFields({
  state,
}: ConnectorConfigurationHelperFieldsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-link">OpenAPI document link</Label>
          <Input
            id="configuration-helper-link"
            value={state.link}
            onChange={(event) => state.onLinkChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-path">Operation path</Label>
          <Input
            id="configuration-helper-path"
            value={state.path}
            onChange={(event) => state.onPathChange(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="configuration-helper-method">Operation method</Label>
          <Input
            id="configuration-helper-method"
            value={state.method}
            onChange={(event) => state.onMethodChange(event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={state.onRequestDraft}
          disabled={state.outcome.kind === "pending"}
        >
          Request Draft
        </Button>
      </div>
    </div>
  );
}
