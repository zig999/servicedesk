import { z } from 'zod';

const subjectAttributeValueSchema = z.object({
  attribute: z.string().min(1),
  value: z.string().min(1),
});

const subjectSchema = z.object({
  type: z.string().min(1),
  attributes: z.array(subjectAttributeValueSchema).min(1),
});

const capabilityIdentitySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export const testConnectorRequestSchema = z.object({
  capability: capabilityIdentitySchema,
  connector: z.string().min(1),
  subject: subjectSchema,
  requester: z.string().min(1),
  input: z.unknown().optional(),
});

export type TestConnectorRequestDto = z.infer<typeof testConnectorRequestSchema>;

const testConnectorRequestEchoSchema = z.object({
  method: z.string().min(1),
  address: z.string().min(1),
  headers: z.record(z.string(), z.string()),
  body: z.unknown().optional(),
});

const testConnectorOutcomeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('response'),
    status: z.int(),
    headers: z.record(z.string(), z.string()),
    body: z.unknown().optional(),
    elapsedMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal('timed-out'),
    elapsedMs: z.number().nonnegative(),
  }),
  z.object({
    kind: z.literal('error'),
    message: z.string().min(1),
    elapsedMs: z.number().nonnegative(),
  }),
]);

export const testConnectorResponseSchema = z.object({
  request: testConnectorRequestEchoSchema,
  response: testConnectorOutcomeSchema,
  orphaned_placeholders: z.array(z.string()).readonly(),
});

export type TestConnectorResponseDto = z.infer<typeof testConnectorResponseSchema>;
