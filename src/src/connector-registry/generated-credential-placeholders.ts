import type {
  ConnectorConfigurationDraftGeneratedCredential,
  ConnectorConfigurationDraftUnresolvedItem,
  ConnectorConfigurationDraftUnresolvedReason,
} from './connector-configuration-draft.js';
import type { OpenApiOperationParameter, OpenApiRequiredSecurityScheme } from './openapi-operation-reader.js';

const CREDENTIAL_PLACEHOLDER_KIND = 'credential';
const AUTHORIZATION_HEADER_NAME = 'Authorization';
const HTTP_BASIC_SCHEME = 'basic';
const HTTP_BEARER_SCHEME = 'bearer';
const NOT_REDUCIBLE_REASON: ConnectorConfigurationDraftUnresolvedReason =
  'security-scheme-not-reducible-to-a-credential';
const OCCUPIED_REASON: ConnectorConfigurationDraftUnresolvedReason = 'drafted-key-occupied-by-another-security-scheme';

export type GeneratedCredentialPlacement = {
  readonly headers: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly cookieSegments: readonly string[];
  readonly generatedCredentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
};

export type GenerateCredentialPlaceholdersOptions = {
  readonly connector: string;
  readonly requiredSecuritySchemes: readonly OpenApiRequiredSecurityScheme[];
};

type CredentialPlacement = {
  readonly namespace: 'headers' | 'query' | 'cookie';
  readonly key: string;
  readonly value: (generatedName: string) => string;
};

type PlacementAccumulator = {
  readonly headers: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly cookieSegments: readonly string[];
  readonly generatedCredentials: readonly ConnectorConfigurationDraftGeneratedCredential[];
  readonly unresolved: readonly ConnectorConfigurationDraftUnresolvedItem[];
  readonly occupiedKeys: ReadonlySet<string>;
};

type PlacedCredentialInput = {
  readonly accumulator: PlacementAccumulator;
  readonly keyIdentity: string;
  readonly schemeName: string;
  readonly generatedName: string;
  readonly placement: CredentialPlacement;
};

export function generateCredentialPlaceholders(
  options: GenerateCredentialPlaceholdersOptions,
): GeneratedCredentialPlacement {
  const { connector, requiredSecuritySchemes } = options;
  const accumulated = requiredSecuritySchemes.reduce<PlacementAccumulator>(
    (accumulator, scheme) => withResolvedScheme(accumulator, connector, scheme),
    emptyAccumulator(),
  );
  return {
    headers: accumulated.headers,
    query: accumulated.query,
    cookieSegments: accumulated.cookieSegments,
    generatedCredentials: accumulated.generatedCredentials,
    unresolved: accumulated.unresolved,
  };
}

export function parameterDisplacedByCredential(
  parameter: OpenApiOperationParameter,
  placement: GeneratedCredentialPlacement,
): ConnectorConfigurationDraftUnresolvedItem | undefined {
  return credentialOccupiesParameterKey(parameter, placement)
    ? { name: parameter.name, reason: OCCUPIED_REASON }
    : undefined;
}

function credentialOccupiesParameterKey(
  parameter: OpenApiOperationParameter,
  placement: GeneratedCredentialPlacement,
): boolean {
  if (parameter.location === 'query') {
    return parameter.name in placement.query;
  }
  if (parameter.location === 'header') {
    return parameter.name in placement.headers;
  }
  if (parameter.location === 'cookie') {
    return placement.cookieSegments.some((segment) => segment.startsWith(`${parameter.name}=`));
  }
  return false;
}

function emptyAccumulator(): PlacementAccumulator {
  return {
    headers: {},
    query: {},
    cookieSegments: [],
    generatedCredentials: [],
    unresolved: [],
    occupiedKeys: new Set<string>(),
  };
}

function withResolvedScheme(
  accumulator: PlacementAccumulator,
  connector: string,
  scheme: OpenApiRequiredSecurityScheme,
): PlacementAccumulator {
  const placement = credentialPlacementFor(scheme);
  if (placement === undefined) {
    return withUnresolved(accumulator, scheme.schemeName, NOT_REDUCIBLE_REASON);
  }
  const keyIdentity = `${placement.namespace}:${placement.key}`;
  if (accumulator.occupiedKeys.has(keyIdentity)) {
    return withUnresolved(accumulator, scheme.schemeName, OCCUPIED_REASON);
  }
  const generatedName = generatedCredentialName(connector, scheme.schemeName);
  return withPlacedCredential({ accumulator, keyIdentity, schemeName: scheme.schemeName, generatedName, placement });
}

function withUnresolved(
  accumulator: PlacementAccumulator,
  name: string,
  reason: ConnectorConfigurationDraftUnresolvedReason,
): PlacementAccumulator {
  return { ...accumulator, unresolved: [...accumulator.unresolved, { name, reason }] };
}

function withPlacedCredential(input: PlacedCredentialInput): PlacementAccumulator {
  const { accumulator, keyIdentity, schemeName, generatedName, placement } = input;
  const value = placement.value(generatedName);
  const base: PlacementAccumulator = {
    ...accumulator,
    generatedCredentials: [...accumulator.generatedCredentials, { name: generatedName, security_scheme: schemeName }],
    occupiedKeys: new Set([...accumulator.occupiedKeys, keyIdentity]),
  };
  if (placement.namespace === 'headers') {
    return { ...base, headers: { ...accumulator.headers, [placement.key]: value } };
  }
  if (placement.namespace === 'query') {
    return { ...base, query: { ...accumulator.query, [placement.key]: value } };
  }
  return { ...base, cookieSegments: [...accumulator.cookieSegments, `${placement.key}=${value}`] };
}

function credentialPlacementFor(scheme: OpenApiRequiredSecurityScheme): CredentialPlacement | undefined {
  if (scheme.kind === 'apiKey') {
    return apiKeyPlacement(scheme.location, scheme.name);
  }
  if (scheme.kind === 'http') {
    return httpSchemePlacement(scheme.httpScheme);
  }
  return undefined;
}

function apiKeyPlacement(location: 'header' | 'query' | 'cookie', name: string): CredentialPlacement {
  if (location === 'header') {
    return { namespace: 'headers', key: name, value: placeholderText };
  }
  if (location === 'query') {
    return { namespace: 'query', key: name, value: placeholderText };
  }
  return { namespace: 'cookie', key: name, value: placeholderText };
}

function httpSchemePlacement(httpScheme: string): CredentialPlacement | undefined {
  const normalized = httpScheme.toLowerCase();
  if (normalized === HTTP_BASIC_SCHEME) {
    return {
      namespace: 'headers',
      key: AUTHORIZATION_HEADER_NAME,
      value: (name: string): string => `Basic ${placeholderText(name)}`,
    };
  }
  if (normalized === HTTP_BEARER_SCHEME) {
    return {
      namespace: 'headers',
      key: AUTHORIZATION_HEADER_NAME,
      value: (name: string): string => `Bearer ${placeholderText(name)}`,
    };
  }
  return undefined;
}

function generatedCredentialName(connector: string, schemeName: string): string {
  return `${upperSnakeSegment(connector)}_${upperSnakeSegment(schemeName)}`;
}

function upperSnakeSegment(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

function placeholderText(name: string): string {
  return `\${${CREDENTIAL_PLACEHOLDER_KIND}:${name}}`;
}
