import { useMemo } from "react";
import { useCapabilities } from "./use-capabilities";
import {
  computeSubjectPlaceholderStatements,
  type SubjectPlaceholderStatement,
} from "../services/connector-configuration-subject-placeholder-statements";

export function useSubjectPlaceholderStatements(
  connector: string,
  configurationValue: string,
): readonly SubjectPlaceholderStatement[] {
  const { capabilities } = useCapabilities();

  const connectorCapabilities = useMemo(
    () => capabilities.filter((capability) => capability.connector === connector),
    [capabilities, connector],
  );

  return useMemo(
    () => computeSubjectPlaceholderStatements(configurationValue, connectorCapabilities),
    [configurationValue, connectorCapabilities],
  );
}
