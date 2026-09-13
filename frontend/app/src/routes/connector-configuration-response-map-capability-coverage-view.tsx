import type { JSX } from "react";
import type { ResponseMapCapabilityCoverage } from "../services/connector-configuration-response-map-capability-coverage";
import {
  RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE,
  RESPONSE_MAP_COVERAGE_HEADING,
  RESPONSE_MAP_EXPECTED_FIELDS_HEADING,
  responseMapExpectedFieldText,
  responseMapKeyReadByNoneText,
  responseMapKeyReadText,
} from "../services/connector-configuration-messages";

export function ResponseMapCapabilityCoverageStatement({
  coverage,
}: {
  coverage: ResponseMapCapabilityCoverage | null;
}): JSX.Element | null {
  if (coverage === null) {
    return null;
  }

  if (coverage.kind === "cannot-be-read") {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{RESPONSE_MAP_COVERAGE_HEADING}</p>
        <p className="text-sm text-muted-foreground">{RESPONSE_MAP_COVERAGE_CANNOT_BE_READ_MESSAGE}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {coverage.keyStatements.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{RESPONSE_MAP_COVERAGE_HEADING}</p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {coverage.keyStatements.map((statement) =>
              statement.kind === "read" ? (
                <li key={`read:${statement.key}`}>
                  {responseMapKeyReadText(statement.key, statement.capabilityLabels)}
                </li>
              ) : (
                <li key={`read-by-none:${statement.key}`}>
                  {responseMapKeyReadByNoneText(statement.key)}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
      {coverage.expectedFieldStatements.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{RESPONSE_MAP_EXPECTED_FIELDS_HEADING}</p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {coverage.expectedFieldStatements.map((statement) => (
              <li key={`${statement.capabilityLabel}:${statement.fieldName}`}>
                {responseMapExpectedFieldText(statement.capabilityLabel, statement.fieldName)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
