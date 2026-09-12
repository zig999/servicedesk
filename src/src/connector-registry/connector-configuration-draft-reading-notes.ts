import type {
  OpenApiOperationResponse,
  OpenApiSuccessResponseField,
  OpenApiSuccessResponseReading,
} from './openapi-operation-reader.js';
import { lowestStatusEntry, lowestStatusSuccessFieldsOf } from './success-response-field-selection.js';
import type {
  ConnectorConfigurationDraftReadingNote,
  ConnectorConfigurationDraftReadingNoteKind,
} from './connector-configuration-draft.js';

export type DraftedReadingNotesInput = {
  readonly method: string;
  readonly path: string;
  readonly responses: readonly OpenApiOperationResponse[];
  readonly successResponseReadings: readonly OpenApiSuccessResponseReading[];
  readonly successResponseFields: readonly OpenApiSuccessResponseField[];
};

type FieldPathOccurrence = {
  readonly path: string;
  readonly status: string;
};

export function draftedReadingNotes(
  input: DraftedReadingNotesInput,
): readonly ConnectorConfigurationDraftReadingNote[] {
  const { method, path, responses, successResponseReadings, successResponseFields } = input;
  return [
    ...responseKeysOfKind(responses, 'default').map((key) => note('default-response-not-drafted', key)),
    ...responseKeysOfKind(responses, 'range').map((key) => note('status-range-not-drafted', key)),
    ...nonJsonSuccessContentNotes(successResponseReadings),
    ...envelopeReadThroughNotes(successResponseReadings),
    ...variantsUnitedNotes(successResponseReadings),
    ...repeatedFieldNameNotes(successResponseFields),
    ...operationLevelNotes({ method, path, responses, successResponseReadings }),
    ...noPropertiesNotes(successResponseReadings),
  ];
}

function note(
  kind: ConnectorConfigurationDraftReadingNoteKind,
  subject: string,
  detail?: string,
): ConnectorConfigurationDraftReadingNote {
  return detail === undefined ? { kind, subject } : { kind, subject, detail };
}

function responseKeysOfKind(
  responses: readonly OpenApiOperationResponse[],
  kind: OpenApiOperationResponse['kind'],
): readonly string[] {
  return responses.filter((response) => response.kind === kind).map((response) => response.key);
}

function nonJsonSuccessContentNotes(
  readings: readonly OpenApiSuccessResponseReading[],
): readonly ConnectorConfigurationDraftReadingNote[] {
  return readings.filter((reading) => !reading.hasJsonContent).map((reading) => note('non-json-success-content-not-read', reading.key));
}

function variantsUnitedNotes(
  readings: readonly OpenApiSuccessResponseReading[],
): readonly ConnectorConfigurationDraftReadingNote[] {
  return readings.filter((reading) => reading.variantsUnited).map((reading) => note('variants-united', reading.key));
}

function noPropertiesNotes(
  readings: readonly OpenApiSuccessResponseReading[],
): readonly ConnectorConfigurationDraftReadingNote[] {
  return readings
    .filter((reading) => reading.hasJsonContent && reading.declaresNoProperties)
    .map((reading) => note('success-schema-declares-no-properties', reading.key));
}

function envelopeReadThroughNotes(
  readings: readonly OpenApiSuccessResponseReading[],
): readonly ConnectorConfigurationDraftReadingNote[] {
  const seen = new Set<string>();
  const notes: ConnectorConfigurationDraftReadingNote[] = [];
  for (const reading of readings) {
    if (reading.envelope !== undefined && !seen.has(reading.envelope)) {
      seen.add(reading.envelope);
      notes.push(note('envelope-read-through', reading.envelope));
    }
  }
  return notes;
}

function operationLevelNotes(input: {
  readonly method: string;
  readonly path: string;
  readonly responses: readonly OpenApiOperationResponse[];
  readonly successResponseReadings: readonly OpenApiSuccessResponseReading[];
}): readonly ConnectorConfigurationDraftReadingNote[] {
  const { method, path, responses, successResponseReadings } = input;
  const subject = `${method.toUpperCase()} ${path}`;
  if (responses.length === 0) {
    return [note('no-responses-declared', subject)];
  }
  const hasSuccessResponseSchema = successResponseReadings.some((reading) => reading.hasJsonContent);
  return hasSuccessResponseSchema ? [] : [note('no-success-response-schema', subject)];
}

function repeatedFieldNameNotes(
  fields: readonly OpenApiSuccessResponseField[],
): readonly ConnectorConfigurationDraftReadingNote[] {
  const byName = fieldsGroupedByName(fields);
  const draftedPathByName = new Map(lowestStatusSuccessFieldsOf(fields).map((field) => [field.name, field.path]));
  const notes: ConnectorConfigurationDraftReadingNote[] = [];
  for (const [name, entries] of byName) {
    const distinctPaths = [...new Set(entries.map((entry) => entry.path))];
    if (distinctPaths.length <= 1) {
      continue;
    }
    const draftedPath = draftedPathByName.get(name);
    const notDrafted = distinctPaths
      .filter((path) => path !== draftedPath)
      .map((path) => ({ path, status: lowestStatusAt(entries, path) }))
      .sort((left, right) => Number(left.status) - Number(right.status));
    notes.push(note('repeated-field-name-path-not-taken', name, detailOf(notDrafted)));
  }
  return notes;
}

function fieldsGroupedByName(
  fields: readonly OpenApiSuccessResponseField[],
): Map<string, OpenApiSuccessResponseField[]> {
  const byName = new Map<string, OpenApiSuccessResponseField[]>();
  for (const field of fields) {
    const entries = byName.get(field.name);
    if (entries === undefined) {
      byName.set(field.name, [field]);
    } else {
      entries.push(field);
    }
  }
  return byName;
}

function lowestStatusAt(entries: readonly OpenApiSuccessResponseField[], path: string): string {
  return lowestStatusEntry(entries.filter((entry) => entry.path === path)).status;
}

function detailOf(occurrences: readonly FieldPathOccurrence[]): string {
  return occurrences.map(({ path, status }) => `${path} (${status})`).join(', ');
}
