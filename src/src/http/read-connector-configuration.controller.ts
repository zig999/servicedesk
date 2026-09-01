import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type {
  ReadConnectorConfigurationParamsDto,
  ReadConnectorConfigurationResponseDto,
} from './dto/read-connector-configuration.dto.js';

export type ReadConnectorConfigurationControllerDependencies = {
  readonly readConnectorConfiguration: (connector: string) => Promise<ConnectorConfiguration>;
};

export async function handleReadConnectorConfigurationRequest(
  dependencies: ReadConnectorConfigurationControllerDependencies,
  params: ReadConnectorConfigurationParamsDto,
): Promise<ReadConnectorConfigurationResponseDto> {
  const configuration = await dependencies.readConnectorConfiguration(params.connector);
  return toReadConnectorConfigurationResponse(configuration);
}

export function toReadConnectorConfigurationResponse(
  configuration: ConnectorConfiguration,
): ReadConnectorConfigurationResponseDto {
  return {
    connector: configuration.connector,
    configuration: configuration.configuration,
  };
}
