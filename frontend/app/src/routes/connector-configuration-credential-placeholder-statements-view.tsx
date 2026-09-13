import type { JSX } from "react";
import {
  CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING,
  credentialPlaceholderStatementText,
} from "../services/connector-configuration-messages";

export function CredentialPlaceholderStatements({
  credentialNames,
}: {
  credentialNames: readonly string[];
}): JSX.Element | null {
  if (credentialNames.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">
        {CREDENTIAL_PLACEHOLDER_STATEMENTS_HEADING}
      </p>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {credentialNames.map((name) => (
          <li key={name}>{credentialPlaceholderStatementText(name)}</li>
        ))}
      </ul>
    </div>
  );
}
