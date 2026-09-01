export const SUBJECT_PLACEHOLDER_KIND = "subject";

export const PLACEHOLDER_ARGUMENT_SEPARATOR = ":";

export const PLACEHOLDER_PATTERN = /\$\{([^}]+)\}/g;

export function splitPlaceholderToken(token: string): readonly [kind: string, argument: string | undefined] {
  const separatorIndex = token.indexOf(PLACEHOLDER_ARGUMENT_SEPARATOR);
  return separatorIndex === -1
    ? [token, undefined]
    : [token.slice(0, separatorIndex), token.slice(separatorIndex + 1)];
}

export function isSubjectPlaceholderToken(
  parts: readonly [string, string | undefined],
): parts is readonly [string, string] {
  return parts[0] === SUBJECT_PLACEHOLDER_KIND && parts[1] !== undefined && parts[1] !== "";
}
