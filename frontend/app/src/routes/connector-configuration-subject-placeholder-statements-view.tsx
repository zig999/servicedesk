import type { JSX } from "react";
import type { SubjectPlaceholderStatement } from "../services/connector-configuration-subject-placeholder-statements";
import {
  SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE,
  SUBJECT_PLACEHOLDER_STATEMENTS_HEADING,
  subjectPlaceholderDeclaredText,
  subjectPlaceholderUndeclaredText,
} from "../services/connector-configuration-messages";

function subjectPlaceholderStatementKey(statement: SubjectPlaceholderStatement): string {
  switch (statement.kind) {
    case "cannot-be-checked":
      return "cannot-be-checked";
    case "declared":
      return `declared:${statement.attributeName}`;
    case "undeclared":
      return `undeclared:${statement.attributeName}`;
  }
}

function subjectPlaceholderStatementText(statement: SubjectPlaceholderStatement): string {
  switch (statement.kind) {
    case "cannot-be-checked":
      return SUBJECT_PLACEHOLDER_CANNOT_BE_CHECKED_MESSAGE;
    case "declared":
      return subjectPlaceholderDeclaredText(statement.attributeName);
    case "undeclared":
      return subjectPlaceholderUndeclaredText(
        statement.attributeName,
        statement.nonDeclaringCapabilityLabels,
      );
  }
}

export function SubjectPlaceholderStatements({
  statements,
}: {
  statements: readonly SubjectPlaceholderStatement[];
}): JSX.Element | null {
  if (statements.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{SUBJECT_PLACEHOLDER_STATEMENTS_HEADING}</p>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {statements.map((statement) => (
          <li key={subjectPlaceholderStatementKey(statement)}>
            {subjectPlaceholderStatementText(statement)}
          </li>
        ))}
      </ul>
    </div>
  );
}
