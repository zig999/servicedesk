import type { Capability } from '../capability-registry/capability.js';
import type {
  ReadCapabilityByIdentityParamsDto,
  ReadCapabilityByIdentityResponseDto,
} from './dto/read-capability-by-identity.dto.js';

export type ReadCapabilityByIdentityControllerDependencies = {
  readonly readCapabilityByIdentity: (name: string, version: string) => Promise<Capability>;
};

export async function handleReadCapabilityByIdentityRequest(
  dependencies: ReadCapabilityByIdentityControllerDependencies,
  params: ReadCapabilityByIdentityParamsDto,
): Promise<ReadCapabilityByIdentityResponseDto> {
  return dependencies.readCapabilityByIdentity(params.name, params.version);
}
