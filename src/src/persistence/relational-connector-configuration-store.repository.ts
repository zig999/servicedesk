import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type { IConnectorConfigurationStore } from '../connector-registry/connector-configuration-store.port.js';
import { ConnectorConfigurationStoreError } from '../errors/connector-configuration-store.error.js';
import { runInTransaction, runStatement, type IStatement } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

interface IConnectorConfigurationRow {
  readonly connector: string;
  readonly configuration: Record<string, unknown>;
}

const CONNECTOR_CONFIGURATIONS_TABLE = 'connector_configurations';

export class RelationalConnectorConfigurationStore implements IConnectorConfigurationStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async readConnectorConfigurations(): Promise<readonly ConnectorConfiguration[]> {
    const rows = await runStatement<IConnectorConfigurationRow>(
      this.connection,
      { text: `SELECT connector, configuration FROM ${CONNECTOR_CONFIGURATIONS_TABLE}` },
      raiseReadFailure,
    );
    return rows.map(toConnectorConfiguration);
  }

  public async writeConnectorConfigurations(configurations: readonly ConnectorConfiguration[]): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, async (tx) => {
      for (const configuration of configurations) {
        await runStatement(tx, upsertStatementFor(configuration), raiseWriteFailure);
      }
    });
  }
}

function toConnectorConfiguration(row: IConnectorConfigurationRow): ConnectorConfiguration {
  return { connector: row.connector, configuration: JSON.stringify(row.configuration) };
}

function upsertStatementFor(configuration: ConnectorConfiguration): IStatement {
  return {
    text: `INSERT INTO ${CONNECTOR_CONFIGURATIONS_TABLE} (connector, configuration)
           VALUES ($1, $2)
           ON CONFLICT (connector) DO UPDATE SET configuration = EXCLUDED.configuration`,
    params: [configuration.connector, configuration.configuration],
  };
}

function raiseReadFailure(cause: unknown): Error {
  return new ConnectorConfigurationStoreError(
    'a read against the connector-configuration store failed',
    { operation: 'read' },
    { cause },
  );
}

function raiseWriteFailure(cause: unknown): Error {
  return new ConnectorConfigurationStoreError(
    'a write against the connector-configuration store failed',
    { operation: 'write' },
    { cause },
  );
}
