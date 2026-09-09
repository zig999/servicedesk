import { expect, it } from 'vitest';
import type { OpenApiOperationParameter, OpenApiRequiredSecurityScheme } from '../../../connector-registry/openapi-operation-reader.js';
import {
  generateCredentialPlaceholders,
  parameterDisplacedByCredential,
} from '../../../connector-registry/generated-credential-placeholders.js';

function apiKeyScheme(
  schemeName: string,
  location: 'header' | 'query' | 'cookie',
  name: string,
): OpenApiRequiredSecurityScheme {
  return { schemeName, kind: 'apiKey', name, location };
}

function httpScheme(schemeName: string, httpSchemeName: string): OpenApiRequiredSecurityScheme {
  return { schemeName, kind: 'http', httpScheme: httpSchemeName };
}

function otherScheme(
  schemeName: string,
  kind: 'oauth2' | 'openIdConnect' | 'mutualTLS',
): OpenApiRequiredSecurityScheme {
  return { schemeName, kind };
}

function parameter(name: string, location: OpenApiOperationParameter['location']): OpenApiOperationParameter {
  return { name, location };
}

it('places an API key header scheme\'s placeholder at its own header key, disclosing the generated name in generated_credentials', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyHeader', 'header', 'X-Api-Key')],
  });

  expect(placement.headers).toEqual({ 'X-Api-Key': '${credential:ERP_HTTP_APIKEYHEADER}' });
  expect(placement.generatedCredentials).toEqual([{ name: 'ERP_HTTP_APIKEYHEADER', security_scheme: 'apiKeyHeader' }]);
  expect(placement.unresolved).toEqual([]);
});

it('places an API key query scheme\'s placeholder at its own query key', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyQuery', 'query', 'api_key')],
  });

  expect(placement.query).toEqual({ api_key: '${credential:ERP_HTTP_APIKEYQUERY}' });
});

it('appends an API key cookie scheme\'s placeholder as its own raw cookie segment rather than a joined Cookie header value', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyCookie', 'cookie', 'session_id')],
  });

  expect(placement.cookieSegments).toEqual(['session_id=${credential:ERP_HTTP_APIKEYCOOKIE}']);
  expect(placement.headers.Cookie).toBeUndefined();
});

it('keeps two API key cookie schemes naming different cookies as two separate segments rather than colliding', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [
      apiKeyScheme('firstCookie', 'cookie', 'session_id'),
      apiKeyScheme('secondCookie', 'cookie', 'tenant_id'),
    ],
  });

  expect(placement.cookieSegments).toEqual([
    'session_id=${credential:ERP_HTTP_FIRSTCOOKIE}',
    'tenant_id=${credential:ERP_HTTP_SECONDCOOKIE}',
  ]);
  expect(placement.unresolved).toEqual([]);
});

it('places an HTTP basic scheme\'s placeholder as the whole Authorization header value, prefixed by "Basic "', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [httpScheme('basicAuth', 'basic')],
  });

  expect(placement.headers.Authorization).toBe('Basic ${credential:ERP_HTTP_BASICAUTH}');
});

it('places an HTTP bearer scheme\'s placeholder as the whole Authorization header value, prefixed by "Bearer "', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [httpScheme('bearerAuth', 'bearer')],
  });

  expect(placement.headers.Authorization).toBe('Bearer ${credential:ERP_HTTP_BEARERAUTH}');
});

it('keeps only the first of two schemes colliding on the Authorization header key, naming the second unresolved with drafted-key-occupied-by-another-security-scheme', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [httpScheme('bearerAuth', 'bearer'), httpScheme('basicAuth', 'basic')],
  });

  expect(placement.headers.Authorization).toBe('Bearer ${credential:ERP_HTTP_BEARERAUTH}');
  expect(placement.generatedCredentials).toEqual([{ name: 'ERP_HTTP_BEARERAUTH', security_scheme: 'bearerAuth' }]);
  expect(placement.unresolved).toEqual([
    { name: 'basicAuth', reason: 'drafted-key-occupied-by-another-security-scheme' },
  ]);
});

it('treats an API key scheme declaring header Authorization as colliding with an HTTP basic scheme on that same key', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyAuth', 'header', 'Authorization'), httpScheme('basicAuth', 'basic')],
  });

  expect(placement.headers.Authorization).toBe('${credential:ERP_HTTP_APIKEYAUTH}');
  expect(placement.unresolved).toEqual([
    { name: 'basicAuth', reason: 'drafted-key-occupied-by-another-security-scheme' },
  ]);
});

it('keeps only the first of two schemes colliding on a non-Authorization header key, naming the second unresolved rather than overwriting the first', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [
      apiKeyScheme('firstKey', 'header', 'X-Tenant'),
      apiKeyScheme('secondKey', 'header', 'X-Tenant'),
    ],
  });

  expect(placement.headers['X-Tenant']).toBe('${credential:ERP_HTTP_FIRSTKEY}');
  expect(placement.generatedCredentials).toEqual([{ name: 'ERP_HTTP_FIRSTKEY', security_scheme: 'firstKey' }]);
  expect(placement.unresolved).toEqual([
    { name: 'secondKey', reason: 'drafted-key-occupied-by-another-security-scheme' },
  ]);
});

it('keeps only the first of two schemes colliding on the same drafted query key, naming the second unresolved', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [
      apiKeyScheme('firstKey', 'query', 'api_key'),
      apiKeyScheme('secondKey', 'query', 'api_key'),
    ],
  });

  expect(placement.query.api_key).toBe('${credential:ERP_HTTP_FIRSTKEY}');
  expect(placement.unresolved).toEqual([
    { name: 'secondKey', reason: 'drafted-key-occupied-by-another-security-scheme' },
  ]);
});

it('treats two API key cookie schemes naming the same cookie as colliding, keeping only the first and naming the second unresolved', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [
      apiKeyScheme('firstKey', 'cookie', 'session_id'),
      apiKeyScheme('secondKey', 'cookie', 'session_id'),
    ],
  });

  expect(placement.cookieSegments).toEqual(['session_id=${credential:ERP_HTTP_FIRSTKEY}']);
  expect(placement.unresolved).toEqual([
    { name: 'secondKey', reason: 'drafted-key-occupied-by-another-security-scheme' },
  ]);
});

it('folds case before replacing characters outside A-Z0-9, rather than replacing lower-case letters away before the fold', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'acme.co',
    requiredSecuritySchemes: [apiKeyScheme('api-key', 'header', 'X-Key')],
  });

  expect(placement.generatedCredentials).toEqual([{ name: 'ACME_CO_API_KEY', security_scheme: 'api-key' }]);
});

it('names an OAuth2 scheme and an OpenID Connect scheme unresolved with security-scheme-not-reducible-to-a-credential, generating no placeholder for either', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [otherScheme('oauth', 'oauth2'), otherScheme('oidc', 'openIdConnect')],
  });

  expect(placement.unresolved).toEqual([
    { name: 'oauth', reason: 'security-scheme-not-reducible-to-a-credential' },
    { name: 'oidc', reason: 'security-scheme-not-reducible-to-a-credential' },
  ]);
  expect(placement.headers).toEqual({});
  expect(placement.query).toEqual({});
  expect(placement.cookieSegments).toEqual([]);
  expect(placement.generatedCredentials).toEqual([]);
});

it('names a mutualTLS scheme and an HTTP scheme using an unrecognized sub-scheme unresolved with the same reason, neither assumed reducible', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [otherScheme('mtls', 'mutualTLS'), httpScheme('digestAuth', 'digest')],
  });

  expect(placement.unresolved).toEqual([
    { name: 'mtls', reason: 'security-scheme-not-reducible-to-a-credential' },
    { name: 'digestAuth', reason: 'security-scheme-not-reducible-to-a-credential' },
  ]);
});

it('generates no placeholder and names no scheme unresolved when the operation requires no security scheme at all', () => {
  const placement = generateCredentialPlaceholders({ connector: 'erp-http', requiredSecuritySchemes: [] });

  expect(placement).toEqual({ headers: {}, query: {}, cookieSegments: [], generatedCredentials: [], unresolved: [] });
});

it('never carries a value read from environment configuration in the generated placeholder or in generated_credentials', () => {
  process.env.ERP_HTTP_APIKEYHEADER = 'a-real-secret-value-from-the-environment';

  try {
    const placement = generateCredentialPlaceholders({
      connector: 'erp-http',
      requiredSecuritySchemes: [apiKeyScheme('apiKeyHeader', 'header', 'X-Api-Key')],
    });

    expect(JSON.stringify(placement).includes('a-real-secret-value-from-the-environment')).toBe(false);
  } finally {
    delete process.env.ERP_HTTP_APIKEYHEADER;
  }
});

it('recognizes HTTP basic and bearer schemes case-insensitively', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [httpScheme('mixedCaseBasic', 'BASIC')],
  });

  expect(placement.headers.Authorization).toBe('Basic ${credential:ERP_HTTP_MIXEDCASEBASIC}');
});

it('reports a query parameter displaced by a security-scheme placeholder as unresolved, leaving the scheme\'s own placeholder untouched', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyQuery', 'query', 'api_key')],
  });

  const displaced = parameterDisplacedByCredential(parameter('api_key', 'query'), placement);

  expect(displaced).toEqual({ name: 'api_key', reason: 'drafted-key-occupied-by-another-security-scheme' });
  expect(placement.query.api_key).toBe('${credential:ERP_HTTP_APIKEYQUERY}');
});

it('reports a header parameter displaced by a security-scheme placeholder as unresolved', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [httpScheme('bearerAuth', 'bearer')],
  });

  const displaced = parameterDisplacedByCredential(parameter('Authorization', 'header'), placement);

  expect(displaced).toEqual({ name: 'Authorization', reason: 'drafted-key-occupied-by-another-security-scheme' });
});

it('reports a cookie parameter displaced by a security-scheme placeholder as unresolved', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyCookie', 'cookie', 'session_id')],
  });

  const displaced = parameterDisplacedByCredential(parameter('session_id', 'cookie'), placement);

  expect(displaced).toEqual({ name: 'session_id', reason: 'drafted-key-occupied-by-another-security-scheme' });
});

it('reports no displacement for a parameter whose own drafted key holds no security-scheme placeholder', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyQuery', 'query', 'api_key')],
  });

  expect(parameterDisplacedByCredential(parameter('other_param', 'query'), placement)).toBeUndefined();
});

it('never reports a path parameter as displaced, since a credential placeholder is never drafted at a path position', () => {
  const placement = generateCredentialPlaceholders({
    connector: 'erp-http',
    requiredSecuritySchemes: [apiKeyScheme('apiKeyQuery', 'query', 'order_id')],
  });

  expect(parameterDisplacedByCredential(parameter('order_id', 'path'), placement)).toBeUndefined();
});
