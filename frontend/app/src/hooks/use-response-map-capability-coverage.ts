import { useMemo } from "react";
import { useCapabilities } from "./use-capabilities";
import {
  computeResponseMapCapabilityCoverage,
  type ResponseMapCapabilityCoverage,
} from "../services/connector-configuration-response-map-capability-coverage";

export function useResponseMapCapabilityCoverage(
  connector: string,
  configurationText: string,
): ResponseMapCapabilityCoverage | null {
  const { capabilities } = useCapabilities();

  const connectorCapabilities = useMemo(
    () => capabilities.filter((capability) => capability.connector === connector),
    [capabilities, connector],
  );

  return useMemo(
    () => computeResponseMapCapabilityCoverage(configurationText, connectorCapabilities),
    [configurationText, connectorCapabilities],
  );
}
