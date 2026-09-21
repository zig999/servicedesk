import { expectTypeOf, it } from 'vitest';
import type { IConnectorConfigurationStore } from '../../../connector-registry/connector-configuration-store.port.js';

it('declares deleteConnectorConfiguration keyed by the connector name alone, returning Promise<void>, alongside the existing read and write methods', () => {
  expectTypeOf<IConnectorConfigurationStore['deleteConnectorConfiguration']>().parameters.toEqualTypeOf<[string]>();
  expectTypeOf<IConnectorConfigurationStore['deleteConnectorConfiguration']>().returns.toEqualTypeOf<Promise<void>>();
});
