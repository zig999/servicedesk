export type ResponseFieldPaths = Readonly<Record<string, string>>;

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

type PathSegment = { readonly kind: 'key'; readonly key: string } | { readonly kind: 'index'; readonly index: number };

type PathResolution = { readonly found: true; readonly value: unknown } | { readonly found: false };

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

const INDEX_SEGMENT_PATTERN = /\[(\d+)\]/g;

function parsePath(path: string): readonly PathSegment[] {
  if (path === '') {
    return [];
  }
  return path.split('.').flatMap(parsePathToken);
}

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
