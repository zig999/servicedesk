import type { ICapabilityStore } from '../capability-registry/capability-store.port.js';
import { CAPABILITY_NATURES, type Capability, type CapabilityNature } from '../capability-registry/capability.js';
import { CapabilityStoreError } from '../errors/capability-store.error.js';
import { runInTransaction, runStatement, type IStatement } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

interface ICapabilityRow {
  readonly name: string;
  readonly version: string;
  readonly nature: string;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;
}

const CAPABILITY_NATURE_VALUES: ReadonlySet<string> = new Set<string>(CAPABILITY_NATURES);

const CAPABILITIES_TABLE = 'capabilities';

export class RelationalCapabilityStore implements ICapabilityStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async readCapabilities(): Promise<readonly Capability[]> {
    const rows = await runStatement<ICapabilityRow>(
      this.connection,
      {
        text: `SELECT name, version, nature, input_schema, output_schema, timeout, connector, concept
               FROM ${CAPABILITIES_TABLE}`,
      },
      raiseReadFailure,
    );
    return rows.map(toCapability);
  }

  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const capability of capabilities) {
        await runStatement(tx, upsertStatementFor(capability), raiseWriteFailure);
      }
    });
  }
}

function isCapabilityNature(value: string): value is CapabilityNature {
  return CAPABILITY_NATURE_VALUES.has(value);
}

function toCapability(row: ICapabilityRow): Capability {
  if (!isCapabilityNature(row.nature)) {
    throw raiseReadFailure(
      new Error(`capabilities holds an unrecognized nature "${row.nature}" for "${row.name}" version "${row.version}"`),
    );
  }
  return {
    name: row.name,
    version: row.version,
    nature: row.nature,
    input_schema: row.input_schema,
    output_schema: row.output_schema,
    timeout: row.timeout,
    connector: row.connector,
    concept: row.concept,
  };
}

function upsertStatementFor(capability: Capability): IStatement {
  return {
    text: `INSERT INTO ${CAPABILITIES_TABLE}
             (name, version, nature, input_schema, output_schema, timeout, connector, concept)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (name, version) DO UPDATE SET
             nature = EXCLUDED.nature,
             input_schema = EXCLUDED.input_schema,
             output_schema = EXCLUDED.output_schema,
             timeout = EXCLUDED.timeout,
             connector = EXCLUDED.connector,
             concept = EXCLUDED.concept`,
    params: [
      capability.name,
      capability.version,
      capability.nature,
      capability.input_schema,
      capability.output_schema,
      capability.timeout,
      capability.connector,
      capability.concept,
    ],
  };
}

function raiseReadFailure(cause: unknown): Error {
  return new CapabilityStoreError('a read against the capability store failed', { operation: 'read' }, { cause });
}

function raiseWriteFailure(cause: unknown): Error {
  return new CapabilityStoreError('a write against the capability store failed', { operation: 'write' }, { cause });
}
