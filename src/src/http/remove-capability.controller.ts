import type { RemoveCapabilityParamsDto } from './dto/remove-capability.dto.js';

export type RemoveCapabilityControllerDependencies = {
  readonly removeCapability: (name: string, version: string) => Promise<void>;
};

export async function handleRemoveCapabilityRequest(
  dependencies: RemoveCapabilityControllerDependencies,
  params: RemoveCapabilityParamsDto,
): Promise<void> {
  await dependencies.removeCapability(params.name, params.version);
}
