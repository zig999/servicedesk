import type { RemoveConnectorParamsDto } from './dto/remove-connector.dto.js';

export type RemoveConnectorControllerDependencies = {
  readonly removeConnector: (connector: string) => Promise<void>;
};

export async function handleRemoveConnectorRequest(
  dependencies: RemoveConnectorControllerDependencies,
  params: RemoveConnectorParamsDto,
): Promise<void> {
  await dependencies.removeConnector(params.connector);
}
