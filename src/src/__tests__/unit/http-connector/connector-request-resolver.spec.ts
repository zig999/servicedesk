// Proof for task/http-observation-runtime/descriptor-placeholder-resolver: the pure translation
// step that turns a Subject's attribute-values, the collection's own requester identity and a
// connector's own opaque call configuration into the concrete address/query/headers/body of one
// outbound HTTP request, with a credential sourced from the environment by name and every
// '${kind[:argument]}' placeholder resolved through one shared string-substitution mechanism —
// never executed as code, and never left unresolved. No stand-in is used anywhere below (TST-03):
// resolveConnectorRequest is a pure function of its own arguments, and the `env` option it already
// exposes is the injected boundary override this task's own module documents, not a fake.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { AssembledConnectorRequest } from '../../../http-connector/connector-call-descriptor.js';
import { resolveConnectorRequest } from '../../../http-connector/connector-request-resolver.js';
import { ConnectorPlaceholderNotResolvedError } from '../../../errors/connector-placeholder-not-resolved.error.js';
import { IncompleteConnectorCallDescriptorError } from '../../../errors/incomplete-connector-call-descriptor.error.js';
import type { Subject } from '../../../investigation/subject.js';

/** A requester identity, spelled out rather than left implicit. */
const A_REQUESTER = 'a-requester';

/** A Subject carrying the one attribute most tests below substitute from. */
const A_SUBJECT: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: '12345' }] };

/** Runs an action expected to throw, returning what it threw — or undefined where it did not, so an assertion against the result still fails visibly rather than the test silently passing. */
function thrownBy(action: () => unknown): unknown {
  try {
    action();
    return undefined;
  } catch (error) {
    return error;
  }
}

it("substitutes a Subject-drawn value into the descriptor's address", () => {
  const configuration = { address: 'https://api.example.com/records/${subject:id}' };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.address).toBe('https://api.example.com/records/12345');
});

it('substitutes a Subject-drawn value into a query value', () => {
  const configuration = { address: 'https://api.example.com', query: { subjectId: '${subject:id}' } };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.query).toEqual({ subjectId: '12345' });
});

it('substitutes a Subject-drawn value into a header value', () => {
  const configuration = { address: 'https://api.example.com', headers: { 'X-Subject-Id': '${subject:id}' } };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.headers).toEqual({ 'X-Subject-Id': '12345' });
});

it('substitutes a Subject-drawn value nested arbitrarily deep inside the body', () => {
  const configuration = {
    address: 'https://api.example.com',
    body: { filter: { criteria: ['${subject:id}', 'a-literal-value'] } },
  };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.body).toEqual({ filter: { criteria: ['12345', 'a-literal-value'] } });
});

it('substitutes every placeholder when several sit inside one template, rather than only the first', () => {
  const configuration = { address: 'https://api.example.com/${subject:id}/as/${requester}' };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.address).toBe('https://api.example.com/12345/as/a-requester');
});

it('places every substituted value by ordinary string replacement — the resolver holds no eval, Function constructor, dynamic import or require anywhere in its own source', async () => {
  const source = await readFile(
    fileURLToPath(new URL('../../../http-connector/connector-request-resolver.ts', import.meta.url)),
    'utf8',
  );

  expect(source).not.toMatch(/\beval\s*\(/);
  expect(source).not.toMatch(/\bnew\s+Function\s*\(/);
  expect(source).not.toMatch(/\bFunction\s*\(/);
  expect(source).not.toMatch(/\bimport\s*\(/);
  expect(source).not.toMatch(/\brequire\s*\(/);
});

it('reads a credential from the named environment variable, with the secret value appearing nowhere in the configuration itself', () => {
  const configuration = {
    address: 'https://api.example.com',
    headers: { Authorization: 'Bearer ${credential:ACME_API_KEY}' },
  };

  const assembled = resolveConnectorRequest({
    configuration,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    env: { ACME_API_KEY: 'the-actual-secret' },
  });

  expect(assembled.headers).toEqual({ Authorization: 'Bearer the-actual-secret' });
});

it("reads the named environment variable at resolution time rather than a value cached from an earlier call — two calls against the same variable name each answer with that call's own environment", () => {
  const configuration = { address: 'https://api.example.com', headers: { Authorization: '${credential:API_KEY}' } };

  const first = resolveConnectorRequest({
    configuration,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    env: { API_KEY: 'first-value' },
  });
  const second = resolveConnectorRequest({
    configuration,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
    env: { API_KEY: 'second-value' },
  });

  expect(first.headers.Authorization).toBe('first-value');
  expect(second.headers.Authorization).toBe('second-value');
});

it('refuses before assembling anything when a placeholder names a Subject attribute the Subject does not carry', () => {
  const configuration = { address: 'https://api.example.com/${subject:missing-attribute}' };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(ConnectorPlaceholderNotResolvedError);
  expect((error as ConnectorPlaceholderNotResolvedError).context).toEqual({
    kind: 'subject-attribute',
    name: 'missing-attribute',
  });
});

it('refuses a Subject attribute present as the empty string exactly as it refuses one the Subject does not carry at all', () => {
  const subjectWithEmptyAttribute: Subject = { type: 'a-subject-type', attributes: [{ attribute: 'id', value: '' }] };
  const configuration = { address: 'https://api.example.com/${subject:id}' };

  const error = thrownBy(() =>
    resolveConnectorRequest({ configuration, subject: subjectWithEmptyAttribute, requester: A_REQUESTER }),
  );

  expect(error).toBeInstanceOf(ConnectorPlaceholderNotResolvedError);
  expect((error as ConnectorPlaceholderNotResolvedError).context).toEqual({ kind: 'subject-attribute', name: 'id' });
});

it('refuses a credential placeholder naming an environment variable that is not set', () => {
  const configuration = { address: 'https://api.example.com', headers: { Authorization: '${credential:MISSING_VAR}' } };

  const error = thrownBy(() =>
    resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER, env: {} }),
  );

  expect(error).toBeInstanceOf(ConnectorPlaceholderNotResolvedError);
  expect((error as ConnectorPlaceholderNotResolvedError).context).toEqual({ kind: 'credential', name: 'MISSING_VAR' });
});

it('refuses a credential placeholder naming an environment variable that is set to the empty string, never carrying that value in the refusal', () => {
  const configuration = { address: 'https://api.example.com', headers: { Authorization: '${credential:EMPTY_VAR}' } };

  const error = thrownBy(() =>
    resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER, env: { EMPTY_VAR: '' } }),
  );

  expect(error).toBeInstanceOf(ConnectorPlaceholderNotResolvedError);
  expect((error as ConnectorPlaceholderNotResolvedError).context).toEqual({ kind: 'credential', name: 'EMPTY_VAR' });
});

it("substitutes the collection's own requester identity wherever '${requester}' appears in the connector's configuration", () => {
  const configuration = { address: 'https://api.example.com', headers: { 'X-Requester': '${requester}' } };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: 'requester-one' });

  expect(assembled.headers).toEqual({ 'X-Requester': 'requester-one' });
});

it('carries whichever requester the caller passed for that one call, unchanged, rather than a default or a value left over from an earlier call', () => {
  const configuration = { address: 'https://api.example.com', headers: { 'X-Requester': '${requester}' } };

  const first = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: 'requester-one' });
  const second = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: 'requester-two' });

  expect(first.headers['X-Requester']).toBe('requester-one');
  expect(second.headers['X-Requester']).toBe('requester-two');
});

it('refuses a configuration that declares no address', () => {
  const configuration = {};

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('treats an address declared as the empty string as no address at all', () => {
  const configuration = { address: '' };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('refuses a configuration whose declared query is not a plain object of string values', () => {
  const configuration = { address: 'https://api.example.com', query: { count: 5 } };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('refuses a configuration whose declared headers is not a plain object of string values', () => {
  const configuration = { address: 'https://api.example.com', headers: ['not', 'an', 'object'] };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('refuses a placeholder naming a kind this resolver does not recognize, rather than leaving it as literal unresolved text', () => {
  const configuration = { address: 'https://api.example.com/${unknown-kind:thing}' };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('refuses a bare "${subject}" placeholder naming no attribute to resolve', () => {
  const configuration = { address: 'https://api.example.com/${subject}' };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('refuses a bare "${credential}" placeholder naming no environment variable to resolve', () => {
  const configuration = { address: 'https://api.example.com/${credential}' };

  const error = thrownBy(() => resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER }));

  expect(error).toBeInstanceOf(IncompleteConnectorCallDescriptorError);
});

it('defaults query and headers to the empty object when the descriptor declares neither', () => {
  const configuration = { address: 'https://api.example.com' };

  const assembled: AssembledConnectorRequest = resolveConnectorRequest({
    configuration,
    subject: A_SUBJECT,
    requester: A_REQUESTER,
  });

  expect(assembled.query).toEqual({});
  expect(assembled.headers).toEqual({});
});

it('leaves the body absent when the descriptor declares none, rather than defaulting it to an empty value', () => {
  const configuration = { address: 'https://api.example.com' };

  const assembled = resolveConnectorRequest({ configuration, subject: A_SUBJECT, requester: A_REQUESTER });

  expect(assembled.body).toBeUndefined();
});
