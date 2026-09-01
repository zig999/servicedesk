import type { Capability, CapabilityRegistration } from '../capability-registry/capability.js';
import type { RegisterCapabilityBodyDto, RegisterCapabilityParamsDto } from './dto/register-capability.dto.js';

export type RegisterCapabilityControllerDependencies = {
  readonly registerCapability: (registration: CapabilityRegistration) => Promise<Capability>;
};

export async function handleRegisterCapabilityRequest(
  dependencies: RegisterCapabilityControllerDependencies,
  params: RegisterCapabilityParamsDto,
  body: RegisterCapabilityBodyDto,
): Promise<Capability> {
  return dependencies.registerCapability({ ...params, ...body });
}
