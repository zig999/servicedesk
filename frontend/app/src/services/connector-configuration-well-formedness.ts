import { isPlainRecord } from "../shared/services/plain-record";

export function configurationTextParsesToNonObject(text: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  return !isPlainRecord(parsed);
}
