import { expect, it, vi } from 'vitest';
import { GlossaryStoreError } from '../../../errors/glossary-store.error.js';
import type { IConnectableQueryable } from '../../../persistence/database-access.js';
import { RelationalGlossaryStore } from '../../../persistence/relational-glossary-store.repository.js';

function fakeBareConnection(query: IConnectableQueryable['query']): IConnectableQueryable {
  return { query } as unknown as IConnectableQueryable;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: IConnectableQueryable; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as IConnectableQueryable, client };
}

function collapsedTexts(recorded: readonly { text: string }[]): string[] {
  return recorded.map((entry) => entry.text.replace(/\s+/g, ' ').trim());
}

interface IRoutedConceptRows {
  readonly concepts: readonly unknown[];
  readonly accepts: readonly unknown[];
}

function recordingConceptQuery(rows: IRoutedConceptRows): {
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>;
  recorded: { text: string; params?: readonly unknown[] }[];
} {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: unknown[] }> => {
    recorded.push({ text, params });
    if (text.includes('FROM concept_accepts')) return { rows: [...rows.accepts] };
    if (text.includes('FROM concepts')) return { rows: [...rows.concepts] };
    return { rows: [] };
  };
  return { handleQuery, recorded };
}

it.each([
  ['subject-type', 'subject_types'],
  ['subject-attribute', 'subject_attributes'],
  ['outcome', 'outcomes'],
  ['action', 'actions'],
  ['recipient', 'recipients'],
] as const)("reads %s from its own table, %s, never another vocabulary's", async (vocabulary, table) => {
  const rows = [{ name: 'a-term' }];
  const query = vi.fn().mockResolvedValue({ rows });
  const store = new RelationalGlossaryStore(fakeBareConnection(query));

  const answered = await store.readTerms(vocabulary);

  expect(query.mock.calls[0]?.[0]).toBe(`SELECT name FROM ${table}`);
  expect(answered).toEqual(rows);
});

it("answers the second call's own rows, never a value the first call already answered", async () => {
  const query = vi
    .fn()
    .mockResolvedValueOnce({ rows: [{ name: 'first-term' }] })
    .mockResolvedValueOnce({ rows: [{ name: 'second-term' }] });
  const store = new RelationalGlossaryStore(fakeBareConnection(query));

  const first = await store.readTerms('outcome');
  const second = await store.readTerms('outcome');

  expect(first).toEqual([{ name: 'first-term' }]);
  expect(second).toEqual([{ name: 'second-term' }]);
  expect(query).toHaveBeenCalledTimes(2);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a term read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const store = new RelationalGlossaryStore(fakeBareConnection(query));

  let caught: unknown;
  try {
    await store.readTerms('subject-type');
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(GlossaryStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
});

it('deletes every existing row and inserts exactly the given terms, in that order, inside one transaction', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);
  const terms = [{ name: 'an-action' }, { name: 'another-action' }];

  await store.writeTerms('action', terms);

  const texts = collapsedTexts(recorded);
  expect(texts[0]).toBe('BEGIN');
  expect(texts[1]).toBe('DELETE FROM actions');
  expect(texts[2]).toContain('INSERT INTO actions');
  expect(texts[3]).toContain('INSERT INTO actions');
  expect(texts[4]).toBe('COMMIT');
  expect(recorded[2]?.params).toEqual(['an-action']);
  expect(recorded[3]?.params).toEqual(['another-action']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it('issues only the DELETE and still commits, when replacing the whole vocabulary with an empty set', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection, client } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);

  await store.writeTerms('recipient', []);

  expect(collapsedTexts(recorded)).toEqual(['BEGIN', 'DELETE FROM recipients', 'COMMIT']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("sends one INSERT per given term, even where the given list repeats a name, relying on the real table to refuse a duplicate rather than deduping it itself", async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);

  await store.writeTerms('recipient', [{ name: 'a-recipient' }, { name: 'a-recipient' }]);

  const inserts = recorded.filter((entry) => entry.text.includes('INSERT'));
  expect(inserts).toHaveLength(2);
  expect(inserts[0]?.params).toEqual(['a-recipient']);
  expect(inserts[1]?.params).toEqual(['a-recipient']);
});

it("raises this store's own typed error, carrying the driver failure as its cause, and rolls back, when a term write is refused", async () => {
  const driverFailure = new Error('the driver refused this write');
  const { connection, client } = fakeTransactionConnection(async (text) => {
    if (text.includes('INSERT')) {
      throw driverFailure;
    }
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);

  let caught: unknown;
  try {
    await store.writeTerms('outcome', [{ name: 'an-outcome' }]);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(GlossaryStoreError);
  expect((caught as Error).cause).toBe(driverFailure);
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});

it('answers each concept with its name, the subject types it accepts, its ttl and its description', async () => {
  const { handleQuery } = recordingConceptQuery({
    concepts: [{ name: 'a-concept', ttl: 120, description: 'what this concept means for the glossary' }],
    accepts: [{ concept_name: 'a-concept', subject_type_name: 'a-subject-type' }],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalGlossaryStore(connection);

  const answered = await store.readConcepts();

  expect(answered).toEqual([
    { name: 'a-concept', accepts: ['a-subject-type'], ttl: 120, description: 'what this concept means for the glossary' },
  ]);
});

it("groups each concept's own accepts by that concept's name, even where concept_accepts interleaves rows across concepts", async () => {
  const { handleQuery } = recordingConceptQuery({
    concepts: [
      { name: 'concept-a', ttl: 60, description: 'concept a, described' },
      { name: 'concept-b', ttl: 90, description: 'concept b, described' },
    ],
    accepts: [
      { concept_name: 'concept-a', subject_type_name: 'alpha' },
      { concept_name: 'concept-b', subject_type_name: 'beta' },
      { concept_name: 'concept-a', subject_type_name: 'gamma' },
    ],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalGlossaryStore(connection);

  const answered = await store.readConcepts();

  expect(answered).toEqual([
    { name: 'concept-a', accepts: ['alpha', 'gamma'], ttl: 60, description: 'concept a, described' },
    { name: 'concept-b', accepts: ['beta'], ttl: 90, description: 'concept b, described' },
  ]);
});

it('answers a concept with an empty accepts array when concept_accepts holds no row for it', async () => {
  const { handleQuery } = recordingConceptQuery({
    concepts: [{ name: 'a-lonely-concept', ttl: 45, description: 'a lonely concept, described' }],
    accepts: [],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalGlossaryStore(connection);

  const answered = await store.readConcepts();

  expect(answered).toEqual([{ name: 'a-lonely-concept', accepts: [], ttl: 45, description: 'a lonely concept, described' }]);
});

it('reads concept_accepts ordered by concept name and subject type name, for a deterministic accepts array', async () => {
  const { handleQuery, recorded } = recordingConceptQuery({ concepts: [], accepts: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalGlossaryStore(connection);

  await store.readConcepts();

  const acceptsQuery = recorded.find((entry) => entry.text.includes('concept_accepts'));
  expect(acceptsQuery?.text.replace(/\s+/g, ' ').trim()).toBe(
    'SELECT concept_name, subject_type_name FROM concept_accepts ORDER BY concept_name, subject_type_name',
  );
});

it('assembles concepts and concept_accepts inside the one transaction it opens, in that order', async () => {
  const { handleQuery, recorded } = recordingConceptQuery({
    concepts: [{ name: 'a-concept', ttl: 60, description: 'a concept, described' }],
    accepts: [{ concept_name: 'a-concept', subject_type_name: 'a-subject-type' }],
  });
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalGlossaryStore(connection);

  await store.readConcepts();

  const texts = collapsedTexts(recorded);
  expect(texts).toEqual([
    'BEGIN',
    'SELECT name, ttl, description FROM concepts',
    'SELECT concept_name, subject_type_name FROM concept_accepts ORDER BY concept_name, subject_type_name',
    'COMMIT',
  ]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a concept read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const { connection } = fakeTransactionConnection(async () => {
    throw driverFailure;
  });
  const store = new RelationalGlossaryStore(connection);

  const rejection = store.readConcepts();

  await expect(rejection).rejects.toBeInstanceOf(GlossaryStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

it("inserts each given concept's own name, ttl and description into concepts, and no concept_accepts row where it accepts nothing", async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);

  await store.writeConcepts([{ name: 'a-concept', accepts: [], ttl: 120, description: 'a fixture concept' }]);

  const conceptInsert = recorded.find((entry) => entry.text.includes('INSERT INTO concepts'));
  expect(conceptInsert?.params).toEqual(['a-concept', 120, 'a fixture concept']);
  expect(recorded.filter((entry) => entry.text.includes('INSERT INTO concept_accepts'))).toEqual([]);
});

it('inserts one concept_accepts row per subject type the given concept accepts, each carrying that concept\'s own name', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const { connection } = fakeTransactionConnection(async (text, params) => {
    recorded.push({ text, params });
    return { rows: [] };
  });
  const store = new RelationalGlossaryStore(connection);

  await store.writeConcepts([{ name: 'a-concept', accepts: ['a-subject-type', 'another-subject-type'], ttl: 60, description: 'a fixture concept' }]);

  const acceptInserts = recorded.filter((entry) => entry.text.includes('INSERT INTO concept_accepts'));
  expect(acceptInserts.map((entry) => entry.params)).toEqual([
    ['a-concept', 'a-subject-type'],
    ['a-concept', 'another-subject-type'],
  ]);
});

it(
  'never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given names either — no matter how many concepts are given',
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const { connection } = fakeTransactionConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [] };
    });
    const store = new RelationalGlossaryStore(connection);

    await store.writeConcepts([
      { name: 'a-concept', accepts: [], ttl: 60, description: 'a fixture concept' },
      { name: 'another-concept', accepts: [], ttl: 90, description: 'another fixture concept' },
    ]);

    const deletesAgainstConcepts = recorded.filter((entry) => entry.text.includes('DELETE') && entry.text.includes('FROM concepts'));
    expect(deletesAgainstConcepts).toEqual([]);
  },
);

it(
  'runs exactly one statement against concepts per given concept, always the same upsert-by-identity INSERT ... ON CONFLICT (name) DO UPDATE, never a SELECT or any other form',
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const { connection } = fakeTransactionConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [] };
    });
    const store = new RelationalGlossaryStore(connection);

    await store.writeConcepts([{ name: 'a-concept', accepts: [], ttl: 60, description: 'a fixture concept' }]);

    const conceptsStatements = recorded.filter((entry) => entry.text.includes('concepts') && !entry.text.includes('concept_accepts'));
    expect(conceptsStatements).toHaveLength(1);
    expect(collapsedTexts(conceptsStatements)[0]).toBe(
      'INSERT INTO concepts (name, ttl, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO UPDATE SET ttl = EXCLUDED.ttl, description = EXCLUDED.description',
    );
  },
);

it(
  "reconciles concept_accepts once per given concept, each one's own DELETE and INSERTs carrying only that concept's own name — for every concept in the given array, not only the first",
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const { connection } = fakeTransactionConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [] };
    });
    const store = new RelationalGlossaryStore(connection);

    await store.writeConcepts([
      { name: 'concept-one', accepts: ['subject-one'], ttl: 60, description: 'concept one' },
      { name: 'concept-two', accepts: ['subject-two'], ttl: 90, description: 'concept two' },
    ]);

    const acceptDeletes = recorded.filter((entry) => entry.text.includes('DELETE FROM concept_accepts'));
    expect(collapsedTexts(acceptDeletes)).toEqual([
      'DELETE FROM concept_accepts WHERE concept_name = $1',
      'DELETE FROM concept_accepts WHERE concept_name = $1',
    ]);
    expect(acceptDeletes.map((entry) => entry.params)).toEqual([['concept-one'], ['concept-two']]);
    const acceptInserts = recorded.filter((entry) => entry.text.includes('INSERT INTO concept_accepts'));
    expect(acceptInserts.map((entry) => entry.params)).toEqual([
      ['concept-one', 'subject-one'],
      ['concept-two', 'subject-two'],
    ]);
  },
);

it(
  "issues no statement referencing investigation_evidence, even when a given concept's description differs from whatever was stored before — writeConcepts never touches that table, so an evidence item's own snapshotted concept_description is never at risk of being rewritten by this call",
  async () => {
    const recorded: { text: string; params?: readonly unknown[] }[] = [];
    const { connection } = fakeTransactionConnection(async (text, params) => {
      recorded.push({ text, params });
      return { rows: [] };
    });
    const store = new RelationalGlossaryStore(connection);

    await store.writeConcepts([
      { name: 'a-concept', accepts: [], ttl: 60, description: 'a new description, different from whatever an evidence item snapshotted earlier' },
    ]);

    const referencingEvidence = recorded.filter((entry) => entry.text.includes('investigation_evidence'));
    expect(referencingEvidence).toEqual([]);
  },
);
