import { expect, it, vi } from 'vitest';
import { createEvidenceUsageReader } from '../../../factories/investigation-store.factory.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';

function fakeBareConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): DatabaseConnection {
  return { query: vi.fn(handleQuery) } as unknown as DatabaseConnection;
}

it(
  "forwards a composite identity's own name and version, in that order, as the underlying query's own parameters, and answers true when a row comes back — through the same factory function build-app.factory.ts's composeResources calls beside createConnectorConfigurationsReader",
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const connection = fakeBareConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [{}] };
    });
    const reader = createEvidenceUsageReader(connection);

    const named = await reader.isCapabilityNamedByEvidence({ name: 'a-capability', version: '2.0.0' });

    expect(named).toBe(true);
    expect(recorded[0]?.params).toEqual(['a-capability', '2.0.0']);
  },
);
