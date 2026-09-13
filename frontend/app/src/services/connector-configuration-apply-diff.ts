import { isPlainRecord } from "../shared/services/plain-record";

export type NestedObjectKey = "statusMap" | "responseMap" | "query" | "headers";

export const NESTED_OBJECT_KEYS: readonly NestedObjectKey[] = [
  "statusMap",
  "responseMap",
  "query",
  "headers",
];

export type KeyChangeSet = {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changed: readonly string[];
};

export type NestedKeyDiff = {
  readonly key: NestedObjectKey;
  readonly diff: KeyChangeSet;
};

export type ApplyConfirmationDiff =
  | { readonly kind: "not-itemisable" }
  | {
      readonly kind: "itemisable";
      readonly topLevel: KeyChangeSet;
      readonly nested: readonly NestedKeyDiff[];
    };

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (isPlainRecord(a) && isPlainRecord(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every(
      (key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]),
    );
  }
  return false;
}

function objectKeyChangeSet(
  fromRecord: Record<string, unknown>,
  toRecord: Record<string, unknown>,
): KeyChangeSet {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const key of Object.keys(toRecord)) {
    if (!Object.prototype.hasOwnProperty.call(fromRecord, key)) {
      added.push(key);
    }
  }
  for (const key of Object.keys(fromRecord)) {
    if (!Object.prototype.hasOwnProperty.call(toRecord, key)) {
      removed.push(key);
    } else if (!deepEqual(fromRecord[key], toRecord[key])) {
      changed.push(key);
    }
  }

  return { added, removed, changed };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  return isPlainRecord(parsed) ? parsed : null;
}

export function computeApplyConfirmationDiff(
  fieldText: string,
  draftText: string,
): ApplyConfirmationDiff {
  const fieldObject = parseJsonObject(fieldText);
  if (fieldObject === null) {
    return { kind: "not-itemisable" };
  }

  const draftObject = parseJsonObject(draftText);
  if (draftObject === null) {
    return { kind: "not-itemisable" };
  }

  const topLevel = objectKeyChangeSet(fieldObject, draftObject);

  const nested: NestedKeyDiff[] = [];
  for (const key of NESTED_OBJECT_KEYS) {
    const fromNested = fieldObject[key];
    const toNested = draftObject[key];
    if (isPlainRecord(fromNested) && isPlainRecord(toNested)) {
      nested.push({ key, diff: objectKeyChangeSet(fromNested, toNested) });
    }
  }

  return { kind: "itemisable", topLevel, nested };
}

function keyChangeSetIsEmpty(changes: KeyChangeSet): boolean {
  return changes.added.length === 0 && changes.removed.length === 0 && changes.changed.length === 0;
}

export function applyConfirmationDiffIsEmpty(diff: ApplyConfirmationDiff): boolean {
  if (diff.kind === "not-itemisable") {
    return false;
  }
  return keyChangeSetIsEmpty(diff.topLevel) && diff.nested.every((entry) => keyChangeSetIsEmpty(entry.diff));
}
