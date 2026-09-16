import { isPlainRecord } from "../shared/services/plain-record";

export const HTTP_CONNECTOR_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

export const HTTP_CONNECTOR_STATUS_MAP_ENDINGS = ["ok", "denied", "timeout", "unavailable"] as const;

const PLACEHOLDER_TEXT_PATTERN = /\$\{[^}]*\}/g;
const ADMITTED_PLACEHOLDER_PATTERN = /^\$\{(subject:[^}]+|requester|credential:[^}]+)\}$/;

function includesString(vocabulary: readonly string[], value: string): boolean {
  return vocabulary.includes(value);
}

export type HttpConnectorDeparture =
  | {
      readonly kind: "method-outside-vocabulary";
      readonly key: "method";
      readonly value: unknown;
      readonly admittedMethods: readonly string[];
    }
  | {
      readonly kind: "status-map-ending-outside-vocabulary";
      readonly key: "statusMap";
      readonly statusMapKey: string;
      readonly value: unknown;
      readonly admittedEndings: readonly string[];
    }
  | {
      readonly kind: "status-map-not-an-object";
      readonly key: "statusMap";
    }
  | {
      readonly kind: "response-map-departure";
      readonly key: "responseMap";
    }
  | {
      readonly kind: "address-absent-or-empty";
      readonly key: "address";
    }
  | {
      readonly kind: "query-or-headers-not-object-of-texts";
      readonly key: "query" | "headers";
    }
  | {
      readonly kind: "placeholder-outside-forms";
      readonly key: "placeholder";
      readonly placeholder: string;
    };

function parseConfigurationObject(configurationText: string): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(configurationText);
  } catch {
    return null;
  }
  return isPlainRecord(parsed) ? parsed : null;
}

function methodDeparture(configuration: Record<string, unknown>): HttpConnectorDeparture | null {
  const value = configuration.method;
  if (typeof value === "string" && includesString(HTTP_CONNECTOR_METHODS, value)) {
    return null;
  }
  return {
    kind: "method-outside-vocabulary",
    key: "method",
    value,
    admittedMethods: HTTP_CONNECTOR_METHODS,
  };
}

function statusMapDepartures(configuration: Record<string, unknown>): readonly HttpConnectorDeparture[] {
  const statusMap = configuration.statusMap;
  if (!isPlainRecord(statusMap)) {
    return [{ kind: "status-map-not-an-object", key: "statusMap" }];
  }
  const departures: HttpConnectorDeparture[] = [];
  for (const [statusMapKey, value] of Object.entries(statusMap)) {
    if (typeof value === "string" && includesString(HTTP_CONNECTOR_STATUS_MAP_ENDINGS, value)) {
      continue;
    }
    departures.push({
      kind: "status-map-ending-outside-vocabulary",
      key: "statusMap",
      statusMapKey,
      value,
      admittedEndings: HTTP_CONNECTOR_STATUS_MAP_ENDINGS,
    });
  }
  return departures;
}

function responseMapDeparture(configuration: Record<string, unknown>): HttpConnectorDeparture | null {
  const responseMap = configuration.responseMap;
  if (!isPlainRecord(responseMap)) {
    return { kind: "response-map-departure", key: "responseMap" };
  }
  const holdsNonText = Object.values(responseMap).some((value) => typeof value !== "string");
  if (holdsNonText) {
    return { kind: "response-map-departure", key: "responseMap" };
  }
  return null;
}

function addressDeparture(configuration: Record<string, unknown>): HttpConnectorDeparture | null {
  const address = configuration.address;
  if (typeof address === "string" && address.length > 0) {
    return null;
  }
  return { kind: "address-absent-or-empty", key: "address" };
}

function objectOfTextsDeparture(
  configuration: Record<string, unknown>,
  key: "query" | "headers",
): HttpConnectorDeparture | null {
  if (!(key in configuration)) {
    return null;
  }
  const value = configuration[key];
  if (isPlainRecord(value) && Object.values(value).every((entry) => typeof entry === "string")) {
    return null;
  }
  return { kind: "query-or-headers-not-object-of-texts", key };
}

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === "string") {
    into.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, into);
    }
    return;
  }
  if (isPlainRecord(value)) {
    for (const item of Object.values(value)) {
      collectStrings(item, into);
    }
  }
}

function placeholderDepartures(configuration: Record<string, unknown>): readonly HttpConnectorDeparture[] {
  const strings: string[] = [];
  collectStrings(configuration, strings);

  const seen = new Set<string>();
  const departures: HttpConnectorDeparture[] = [];
  for (const text of strings) {
    const matches = text.match(PLACEHOLDER_TEXT_PATTERN);
    if (matches === null) {
      continue;
    }
    for (const placeholder of matches) {
      if (ADMITTED_PLACEHOLDER_PATTERN.test(placeholder) || seen.has(placeholder)) {
        continue;
      }
      seen.add(placeholder);
      departures.push({ kind: "placeholder-outside-forms", key: "placeholder", placeholder });
    }
  }
  return departures;
}

export function computeHttpConnectorDepartures(
  configurationText: string,
): readonly HttpConnectorDeparture[] {
  const configuration = parseConfigurationObject(configurationText);
  if (configuration === null) {
    return [];
  }

  const departures: HttpConnectorDeparture[] = [];

  const method = methodDeparture(configuration);
  if (method !== null) {
    departures.push(method);
  }

  departures.push(...statusMapDepartures(configuration));

  const responseMap = responseMapDeparture(configuration);
  if (responseMap !== null) {
    departures.push(responseMap);
  }

  const address = addressDeparture(configuration);
  if (address !== null) {
    departures.push(address);
  }

  const query = objectOfTextsDeparture(configuration, "query");
  if (query !== null) {
    departures.push(query);
  }

  const headers = objectOfTextsDeparture(configuration, "headers");
  if (headers !== null) {
    departures.push(headers);
  }

  departures.push(...placeholderDepartures(configuration));

  return departures;
}
