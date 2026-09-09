import { expect, it } from 'vitest';
import { OpenApiOperationNotFoundError } from '../../../errors/openapi-operation-not-found.error.js';

it('names itself OpenApiOperationNotFoundError and carries the requested path and method verbatim in context', () => {
  const error = new OpenApiOperationNotFoundError('/widgets/{id}', 'PATCH');

  expect(error.name).toBe('OpenApiOperationNotFoundError');
  expect(error.context).toEqual({ path: '/widgets/{id}', method: 'PATCH' });
});

it('builds a message naming both the requested path and method', () => {
  const error = new OpenApiOperationNotFoundError('/widgets/{id}', 'PATCH');

  expect(error.message).toContain('/widgets/{id}');
  expect(error.message).toContain('PATCH');
});
