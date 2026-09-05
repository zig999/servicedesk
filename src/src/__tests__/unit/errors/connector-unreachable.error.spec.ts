import { expect, it } from 'vitest';
import { ConnectorUnreachableError } from '../../../errors/connector-unreachable.error.js';

it('names itself ConnectorUnreachableError and carries only the connector in its context', () => {
  const error = new ConnectorUnreachableError('a-connector');

  expect(error.name).toBe('ConnectorUnreachableError');
  expect(error.context).toEqual({ connector: 'a-connector' });
});

it('preserves the underlying transport rejection as its own cause, even though nothing reads it back out through a caller-visible field', () => {
  const transportRejection = new Error('a genuine network failure');

  const error = new ConnectorUnreachableError('a-connector', { cause: transportRejection });

  expect(error.cause).toBe(transportRejection);
  expect(error.context).toEqual({ connector: 'a-connector' });
});

it('constructs with no cause at all when none is given, rather than requiring one', () => {
  const error = new ConnectorUnreachableError('a-connector');

  expect(error.cause).toBeUndefined();
});

it("names only the connector in its own message, never an address, query, header or body value", () => {
  const error = new ConnectorUnreachableError('a-marker-connector');

  expect(error.message).toContain('a-marker-connector');
  expect(error.message).not.toMatch(/https?:\/\//);
});
