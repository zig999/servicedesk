// a suppressed `@ts-expect-error` line executes as ordinary, harmless JavaScript.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, expectTypeOf, it } from 'vitest';
import * as connectorConfigurationDraftModule from '../../../connector-registry/connector-configuration-draft.js';
import {
  CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS,
} from '../../../connector-registry/connector-configuration-draft.js';
import type {
  ConnectorConfigurationDraft,
  ConnectorConfigurationDraftGeneratedCredential,
  ConnectorConfigurationDraftMethodMismatch,
  ConnectorConfigurationDraftReadingNote,
  ConnectorConfigurationDraftReadingNoteKind,
  ConnectorConfigurationDraftResponseField,
  ConnectorConfigurationDraftStatusReading,
  ConnectorConfigurationDraftUnresolvedItem,
} from '../../../connector-registry/connector-configuration-draft.js';
import type { EvidenceResult } from '../../../investigation/evidence-result.js';

it('admits exactly the three vocabulary reasons the specification enumerates, and no other value', () => {
  const expected = [
    'no-capability-registered',
    'security-scheme-not-reducible-to-a-credential',
    'drafted-key-occupied-by-another-security-scheme',
  ];

  expect([...CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS].sort()).toEqual([...expected].sort());
});

it('refuses an unresolved item whose reason is not one of the four vocabulary values', () => {
  // @ts-expect-error — reason is typed as the closed vocabulary, never a bare string
  const invalid: ConnectorConfigurationDraftUnresolvedItem = { name: 'x', reason: 'not-a-real-reason' };
  void invalid;
});

it('accepts a draft whose unresolved and generated-credentials lists are both empty, since resolving every operation reference and declaring no security scheme are each a legitimate outcome', () => {
  const draft: ConnectorConfigurationDraft = {
    connector: 'a-connector',
    configuration: '{}',
    unresolved: [],
    generated_credentials: [],
    status_readings: [],
    response_fields: [],
    reading_notes: [],
  };

  expect(draft.unresolved).toEqual([]);
  expect(draft.generated_credentials).toEqual([]);
});

it('refuses a draft that omits its unresolved or generated-credentials list instead of declaring it present and empty', () => {
  // @ts-expect-error — unresolved and generated_credentials are required, present-but-possibly-empty fields
  const invalid: ConnectorConfigurationDraft = { connector: 'a-connector', configuration: '{}' };
  void invalid;
});

it('accepts a draft with no method_mismatch, leaving the field absent rather than defaulted', () => {
  const draft: ConnectorConfigurationDraft = {
    connector: 'a-connector',
    configuration: '{}',
    unresolved: [],
    generated_credentials: [],
    status_readings: [],
    response_fields: [],
    reading_notes: [],
  };

  expect(draft.method_mismatch).toBeUndefined();
});

it('declares no capability field on the draft, so a generator resolves any number of capability references — including none — without the type ever exposing the count', () => {
  expectTypeOf<ConnectorConfigurationDraft>().toEqualTypeOf<{
    readonly connector: string;
    readonly configuration: string;
    readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
    readonly generated_credentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
    readonly method_mismatch?: ConnectorConfigurationDraftMethodMismatch;
    readonly status_readings: readonly ConnectorConfigurationDraftStatusReading[];
    readonly response_fields: readonly ConnectorConfigurationDraftResponseField[];
    readonly reading_notes: readonly ConnectorConfigurationDraftReadingNote[];
  }>();
});

it('declares an unresolved item as exactly a name and a single reason, never a set of reasons', () => {
  expectTypeOf<ConnectorConfigurationDraftUnresolvedItem>().toEqualTypeOf<{
    readonly name: string;
    readonly reason: (typeof CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS)[number];
  }>();
});

it("declares a generated credential as exactly the generated name and the security scheme's own name", () => {
  expectTypeOf<ConnectorConfigurationDraftGeneratedCredential>().toEqualTypeOf<{
    readonly name: string;
    readonly security_scheme: string;
  }>();
});

it("declares a method mismatch as exactly the registered method and the operation's method, as two separate fields", () => {
  expectTypeOf<ConnectorConfigurationDraftMethodMismatch>().toEqualTypeOf<{
    readonly registered: string;
    readonly operation: string;
  }>();
});

it("the draft's domain module carries no import statement at all, naming no framework, driver or provider client", async () => {
  const modulePath = fileURLToPath(
    new URL('../../../connector-registry/connector-configuration-draft.ts', import.meta.url),
  );
  const source = await readFile(modulePath, 'utf8');

  const importSpecifiers = [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)];

  expect(importSpecifiers).toEqual([]);
});

it('exports no runtime guard function alongside the closed vocabulary — only the vocabulary array itself carries a runtime value', () => {
  expect(Object.keys(connectorConfigurationDraftModule)).toEqual([
    'CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS',
    'CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS',
  ]);
});

it('declares a status reading as exactly a status, an ending typed by the same evidence-result the draft mapped it to, and an optional declared_as', () => {
  expectTypeOf<ConnectorConfigurationDraftStatusReading>().toEqualTypeOf<{
    readonly status: string;
    readonly ending: EvidenceResult;
    readonly declared_as?: string;
  }>();
});

it('declares a response field as exactly a name, a path and a status, with declared_type, declared_required and envelope optional', () => {
  expectTypeOf<ConnectorConfigurationDraftResponseField>().toEqualTypeOf<{
    readonly name: string;
    readonly path: string;
    readonly status: string;
    readonly declared_type?: string;
    readonly declared_required?: boolean;
    readonly envelope?: string;
  }>();
});

it('declares a reading note as exactly a kind typed by the reading-note-kind vocabulary and a subject, with detail optional', () => {
  expectTypeOf<ConnectorConfigurationDraftReadingNote>().toEqualTypeOf<{
    readonly kind: ConnectorConfigurationDraftReadingNoteKind;
    readonly subject: string;
    readonly detail?: string;
  }>();
});

it("types a reading note's kind by exactly the nine kinds the specification enumerates, and no other value", () => {
  expectTypeOf<ConnectorConfigurationDraftReadingNoteKind>().toEqualTypeOf<
    | 'default-response-not-drafted'
    | 'status-range-not-drafted'
    | 'non-json-success-content-not-read'
    | 'envelope-read-through'
    | 'variants-united'
    | 'repeated-field-name-path-not-taken'
    | 'no-responses-declared'
    | 'no-success-response-schema'
    | 'success-schema-declares-no-properties'
  >();
});
