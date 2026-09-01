import type {
  ConnectorConfiguration,
  ConnectorConfigurationRegistration,
} from '../connector-registry/connector-configuration.js';
import type { RegisterConnectorBodyDto, RegisterConnectorParamsDto } from './dto/register-connector.dto.js';

export type RegisterConnectorControllerDependencies = {
  readonly registerConnector: (
    registration: ConnectorConfigurationRegistration,
  ) => Promise<ConnectorConfiguration>;
};

export async function handleRegisterConnectorRequest(
  dependencies: RegisterConnectorControllerDependencies,
  params: RegisterConnectorParamsDto,
  body: RegisterConnectorBodyDto,
): Promise<ConnectorConfiguration> {
  return dependencies.registerConnector({ ...params, ...body });
}
