import type { ConnectorConfiguration } from './connector-configuration.js';
import {
  parsedConnectorConfiguration,
  type ConnectorConfigurationResolution,
} from './connector-configuration-registry.service.js';
import type { ConnectorConfigurationDraftMethodMismatch } from './connector-configuration-draft.js';

export type RegisteredConnectorConfigurationReader = {
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfigurationResolution>;
};

export async function registeredMethodMismatch(
  registry: RegisteredConnectorConfigurationReader,
  connector: string,
  operationMethod: string,
): Promise<ConnectorConfigurationDraftMethodMismatch | undefined> {
  const resolution = await registry.readConnectorConfiguration(connector);
  if (!resolution.held) {
    return undefined;
  }
  const registeredMethod = declaredMethod(resolution.configuration);
  return registeredMethod === undefined ? undefined : mismatchOrUndefined(registeredMethod, operationMethod);
}

function declaredMethod(configuration: ConnectorConfiguration): string | undefined {
  const parsed = parsedConnectorConfiguration(configuration);
  return typeof parsed.method === 'string' ? parsed.method : undefined;
}

function mismatchOrUndefined(
  registeredMethod: string,
  operationMethod: string,
): ConnectorConfigurationDraftMethodMismatch | undefined {
  const registered = registeredMethod.toUpperCase();
  const operation = operationMethod.toUpperCase();
  return registered === operation ? undefined : { registered, operation };
}
