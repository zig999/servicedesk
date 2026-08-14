// The opposite-direction translation from descriptor-placeholder-resolver's
// own request-assembly translation
// (task/http-observation-runtime/descriptor-placeholder-resolver, whose own
// connector-call-descriptor.ts and connector-request-resolver.ts turn Subject
// data into an outbound request): this module turns an arbitrary parsed HTTP
// response body into a flat, glossary-keyed object
// (task/http-observation-runtime/response-path-extractor). The two compose
// later, at the adapter that calls both
// (task/http-observation-runtime/http-declarative-observation-source),
// without either depending on the other's internals — this module imports
// nothing from ./connector-call-descriptor.js or
// ./connector-request-resolver.js, and shares no type with either.
//
// The one place a source system's own response shape stops and the
// glossary's vocabulary starts
// (constraints/evidence-normalization-is-an-anticorruption-layer,
// rules/integration/evidence-arrives-in-the-glossary-vocabulary): given a
// mapping from a glossary-vocabulary field name to a path into the response
// body, this module reads each path and returns a flat object keyed exactly
// by the mapping's own field names — never by a name taken from the
// response's own structure.
//
// Path syntax (this module's own free technical design; the scope's own
// JSONPath illustration is a non-binding technical suggestion, per this
// task's own Notes — any notation supporting a nested object key and an
// array index is equally acceptable): a dot-separated sequence of segments,
// walked left to right over the parsed body one step at a time. A segment is
// a plain object-key name, optionally followed by one or more bracketed
// non-negative integers ("[<n>]") naming an array index to descend into
// after that key — e.g. "readings[0].value" reads the "readings" key, takes
// its first element, then reads that element's "value" key; "matrix[0][1]"
// descends two array indices in a row; a path may also open directly on an
// index, e.g. "[0].id", for a response whose top level is itself an array.
// A key name cannot itself contain '.', '[' or ']' — this notation has no
// escaping for those characters the way JSONPath's own bracket-quoted form
// would, but every criterion this task states is at the nested-key and
// array-index level, never at the level of what a key may be spelled, and
// the scope's own illustration is explicitly non-binding on exactly this
// point.

/**
 * One field name, in the glossary's vocabulary, mapped to the path this
 * module reads its value from inside the parsed response body — the whole
 * of what this pure extraction engine takes besides the body itself.
 */
export type ResponseFieldPaths = Readonly<Record<string, string>>;

/**
 * Reads every path in `fieldPaths` out of `body`, returning a flat object
 * whose keys are exactly the field names `fieldPaths` declares — none
 * omitted, none added — for every path that resolves inside `body`
 * (criterion 3). A path naming a nested object key returns the value found
 * at that key (criterion 1); a path including an array index returns the
 * value found at that index (criterion 2). A path that does not resolve — a
 * missing object key, an array index out of bounds, or a segment expecting
 * an object or array where the body holds something else — is left out of
 * the returned object rather than included as `undefined` or thrown as a
 * fault: the same "absent is reported as nothing found, never as a thrown
 * fault" posture citation-validation.ts's own declaredFieldsOf already
 * established for a malformed or absent schema.
 */
export function extractResponseFields(fieldPaths: ResponseFieldPaths, body: unknown): Record<string, unknown> {
  const extracted: Record<string, unknown> = {};
  for (const [field, path] of Object.entries(fieldPaths)) {
    const resolution = resolvePath(body, path);
    if (resolution.found) {
      extracted[field] = resolution.value;
    }
  }
  return extracted;
}

/** One parsed path segment: a plain object-key lookup, or an array-index lookup. */
type PathSegment = { readonly kind: 'key'; readonly key: string } | { readonly kind: 'index'; readonly index: number };

/**
 * Whether a path resolved inside the body and, if so, the value it named —
 * kept as one result type rather than returning `unknown` alone, so a
 * resolved `null` is distinguishable from "did not resolve".
 */
type PathResolution = { readonly found: true; readonly value: unknown } | { readonly found: false };

/** Walks `path`'s own segments over `body`, one lookup at a time, stopping the moment a segment does not resolve. */
function resolvePath(body: unknown, path: string): PathResolution {
  let current: unknown = body;
  for (const segment of parsePath(path)) {
    const step = descend(current, segment);
    if (!step.found) {
      return step;
    }
    current = step.value;
  }
  return { found: true, value: current };
}

/**
 * Looks up one segment inside `current`, answering `found: false` rather
 * than throwing where the shape does not match: an object-key segment
 * against anything but a plain object, a key that object does not carry, an
 * index segment against anything but an array, or an index outside that
 * array's own bounds.
 */
function descend(current: unknown, segment: PathSegment): PathResolution {
  if (segment.kind === 'key') {
    if (!isPlainObject(current) || !Object.prototype.hasOwnProperty.call(current, segment.key)) {
      return { found: false };
    }
    return { found: true, value: current[segment.key] };
  }
  if (!Array.isArray(current) || segment.index >= current.length) {
    return { found: false };
  }
  return { found: true, value: current[segment.index] };
}

/** Matches one bracketed non-negative-integer index, e.g. "[0]" (TYP-04: named once rather than spelled out at each parse site). */
const INDEX_SEGMENT_PATTERN = /\[(\d+)\]/g;

/** Splits one dot-separated path into its own segments, in order — the empty path resolving to no segments at all, i.e. the whole body. */
function parsePath(path: string): readonly PathSegment[] {
  if (path === '') {
    return [];
  }
  return path.split('.').flatMap(parsePathToken);
}

/** Parses one dot-separated token ("readings[0]", "[0]", or a bare "value") into its own key segment (if any), followed by its own index segments, in order. */
function parsePathToken(token: string): readonly PathSegment[] {
  const firstBracket = token.indexOf('[');
  const keyPart = firstBracket === -1 ? token : token.slice(0, firstBracket);
  const indexPart = firstBracket === -1 ? '' : token.slice(firstBracket);
  const keySegment: readonly PathSegment[] = keyPart === '' ? [] : [{ kind: 'key', key: keyPart }];
  const indexSegments: readonly PathSegment[] = [...indexPart.matchAll(INDEX_SEGMENT_PATTERN)].map(
    (match): PathSegment => ({ kind: 'index', index: Number(match[1]) }),
  );
  return [...keySegment, ...indexSegments];
}

/** Whether a parsed value is a non-null, non-array object — the only shape an object-key segment may descend into. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
