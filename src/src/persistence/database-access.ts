export interface IStatement {
  readonly text: string;
  readonly params?: readonly unknown[];
}

export interface IQueryable {
  query<R = Record<string, unknown>>(text: string, params?: readonly unknown[]): Promise<{ rows: R[] }>;
}

export interface IConnectableQueryable extends IQueryable {
  connect(): Promise<IQueryable & { release(error?: Error): void }>;
}

export type RaiseStoreError = (cause: unknown) => Error;

export async function runStatement<R = Record<string, unknown>>(
  connection: IQueryable,
  statement: IStatement,
  raise: RaiseStoreError,
): Promise<readonly R[]> {
  try {
    const { rows } = await connection.query<R>(statement.text, statement.params);
    return rows;
  } catch (error) {
    throw raise(error);
  }
}

export async function queryOneOrAbsent<R = Record<string, unknown>>(
  connection: IQueryable,
  statement: IStatement,
  raise: RaiseStoreError,
): Promise<R | undefined> {
  const rows = await runStatement<R>(connection, statement, raise);
  return rows[0];
}

export async function runInTransaction<T>(
  connection: IConnectableQueryable,
  raise: RaiseStoreError,
  work: (tx: IQueryable) => Promise<T>,
): Promise<T> {
  const client = await openTransaction(connection, raise);
  try {
    const result = await work(client);
    await commitTransaction(client, raise);
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function openTransaction(connection: IConnectableQueryable, raise: RaiseStoreError) {
  try {
    const client = await connection.connect();
    try {
      await client.query('BEGIN');
      return client;
    } catch (error) {
      client.release();
      throw error;
    }
  } catch (error) {
    throw raise(error);
  }
}

async function commitTransaction(client: IQueryable, raise: RaiseStoreError): Promise<void> {
  try {
    await client.query('COMMIT');
  } catch (error) {
    throw raise(error);
  }
}
