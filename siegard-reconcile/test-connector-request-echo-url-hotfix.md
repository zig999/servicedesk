---
contract_version: siegard-reconcile/5
title: Review of test-connector request echo URL hotfix
summary: Files delivered by task/test-connector-request-echo-url-hotfix/echo-address-error-is-reported
  under initiative test-connector-request-echo-url-hotfix, which fixes POST /v1/test-connector's request-echo
  path to refuse a non-absolute-URL address with a typed 422 and report an unreachable connector as a
  completed 200 test, instead of an opaque 500.
target: backend
files:
- path: src/__tests__/unit/http/test-connector.routes.spec.ts
  change: Five new tests proving the 422 invalid-address refusal, the 200 unreachable-connector answer,
    the capability-timeout carve-out, and two pre-existing non-regression tests protected; one pre-existing
    assertion updated from kind:'error' to kind:'unreachable' to match this delivery's own legitimate
    change (disclosed as a divergence in the implementation record).
- path: src/errors/connector-call-address-not-absolute-url.error.ts
  change: New typed domain error (name, message, context.address) raised when a connector configuration's
    resolved call address is not a valid absolute URL.
- path: src/errors/status-map.ts
  change: Maps ConnectorCallAddressNotAbsoluteUrlError to HTTP 422, alongside the project's other domain-to-transport
    mappings.
- path: src/http/dto/test-connector.dto.ts
  change: Replaces the test-connector response's generic {kind:'error', message, elapsedMs} outcome member
    with a {kind:'unreachable', error:{code, message, details:{connector}}, elapsedMs} member, carrying
    no response status.
- path: src/http/test-connector.controller.ts
  change: Before issuing any call, validates the masked resolved address is parseable as an absolute URL
    (throwing ConnectorCallAddressNotAbsoluteUrlError, uncaught, otherwise); a call that fails before
    any HTTP response now resolves to a structured 'unreachable' outcome naming ConnectorUnreachableError
    and the connector, in place of the previous generic {kind:'error'} shape that let a raw address-parsing
    TypeError from the echo step reach Fastify's generic handler uncaught.
nodes:
- node: constraints/a-domain-error-unmapped-by-status-is-refused-generically
  conforms: false
  how: "no named file holds this fact now: src/errors/status-map.ts read `nowhere` — export function statusForError(error:\
    \ unknown): number | undefined {\n  if (!(error instanceof Error)) {\n    return undefined;\n  }\n\
    \  for (const [errorClass, status] of STATUS_BY_ERROR_CLASS) {\n    if (error instanceof errorClass)\
    \ {\n      return status;\n    }\n  }\n  return undefined;\n} The function only returns `undefined`\
    \ for an error the map does not name; the HTTP 500 status, the `INTERNAL_ERROR` code and the fixed\
    \ message the node states are not declared anywhere in this file — they are supplied by whatever reads\
    \ this function's `undefined` result."
  observed_at:
  - src/errors/status-map.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: "src/http/test-connector.controller.ts: held at the whole handleTestConnectorRequest handler —\
    \ no authentication middleware, guard or check is declared or invoked before dispatch, and the requester\
    \ travels straight from the request body into the resolved call with no further resolution — export\
    \ async function handleTestConnectorRequest(\n  dependencies: TestConnectorControllerDependencies,\n\
    \  body: TestConnectorRequestDto,\n): Promise<TestConnectorResponseDto> {\n...\nconst { issued, echoed\
    \ } = resolveTestRequests(configuration.parsed, subject, body.requester);"
  encoded_at:
  - src/http/test-connector.controller.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for CapabilityIdentityNotFoundError
    — [CapabilityIdentityNotFoundError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries answering this registry''s
    own reads and writes — [ConnectorConfigurationNotFoundError, 404], [ConnectorConfigurationNotWellFormedError,
    422], [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: "src/http/dto/test-connector.dto.ts: held at the testConnectorRequestSchema (lines 18-24) and testConnectorResponseSchema\
    \ (lines 60-64), which together shape the one exercise-and-answer this contract publishes — export\
    \ const testConnectorRequestSchema = z.object({\n  capability: capabilityIdentitySchema,\n  connector:\
    \ z.string().min(1),\n  subject: subjectSchema,\n  requester: z.string().min(1),\n  input: z.unknown().optional(),\n\
    });\n...\nexport const testConnectorResponseSchema = z.object({\n  request: testConnectorRequestEchoSchema,\n\
    \  response: testConnectorOutcomeSchema,\n  orphaned_placeholders: z.array(z.string()).readonly(),\n\
    });\nsrc/http/test-connector.controller.ts: held at the whole handleTestConnectorRequest function\
    \ body — issues the configured call once through issueOutcome, assembles a subject via buildSubject\
    \ rather than reading one back, and returns only a request echo, response outcome and orphaned-placeholder\
    \ list (nothing persisted as evidence) — const response = await issueOutcome({\n  httpClient: dependencies.httpClient,\n\
    \  method: httpFields.method,\n  request: issued,\n  timeoutMs: capability.timeout,\n  connector:\
    \ body.connector,\n});\n...\nreturn {\n  request: requestEcho(httpFields.method, echoed),\n  response,\n\
    \  orphaned_placeholders: orphanedPlaceholderNames,\n};"
  encoded_at:
  - src/http/dto/test-connector.dto.ts
  - src/http/test-connector.controller.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries answering diagnose''s own
    refusals — [CaseVersionNotReleasedError, 409], [SubjectDoesNotCoverCaseInputsError, 422], [SubjectCarriesNoAttributeError,
    422], [InvestigationWriteDeadlineExceededError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/knowledge/case-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries answering this surface''s
    own lifecycle operations — [CaseAlreadyHasDraftError, 409], [ManifestPositionOccupiedError, 409],
    [CaseVersionNotDraftError, 409], [CaseVersionNotDraftAtReleaseError, 409], [CaseHoldsNoDraftError,
    409], [ReleasedHypothesisRevisionNotAlterableError, 409], [HypothesisRevisionNotDraftAtReleaseError,
    409], [CaseVersionNotReleasableError, 422], [ManifestWouldHoldNoHypothesisError, 422], [HypothesisRevisionCollectsNoConceptError,
    422], [HypothesisNotInManifestError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: "src/http/test-connector.controller.ts: held at resolveTestedConnectorConfiguration, which reads\
    \ the configuration as raw JSON text and as a parsed record, and the separate refusal paths for capability\
    \ vs. connector configuration that reflect a capability's connector attribute not being enforced to\
    \ resolve to an existing configuration — async function resolveTestedConnectorConfiguration(\n  dependencies:\
    \ TestConnectorControllerDependencies,\n  connector: string,\n): Promise<ResolvedTestConnectorConfiguration>\
    \ {\n  const resolution = await dependencies.readConnectorConfiguration(connector);\n  if (!resolution.held)\
    \ {\n    throw new ConnectorConfigurationNotFoundError(connector);\n  }\n  return { raw: resolution.configuration,\
    \ parsed: parsedConnectorConfiguration(resolution.configuration) };\n}"
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/glossary/a-concept-declares-its-description
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConceptDescriptionRequiredError
    — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-glossary-read-by-an-unheld-name-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for ConceptNotHeldError and
    VocabularyTermNotHeldError — [ConceptNotHeldError, 404], [VocabularyTermNotHeldError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/glossary/a-vocabulary-holds-each-name-once
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for DuplicateGlossaryNameError
    — [DuplicateGlossaryNameError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for MalformedCapabilityInputSchemaError
    — [MalformedCapabilityInputSchemaError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for ConnectorConfigurationNotWellFormedError
    and IncompleteConnectorConfigurationError — [ConnectorConfigurationNotWellFormedError, 422], [IncompleteConnectorConfigurationError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: false
  how: "src/http/dto/test-connector.dto.ts, the subjectAttributeValueSchema definition (lines 3-6), embedded\
    \ in subjectSchema (lines 8-11) and required as testConnectorRequestSchema's subject field (line 21):\
    \ const subjectAttributeValueSchema = z.object({\n  attribute: z.string().min(1),\n  value: z.string().min(1),\n\
    }); — An integrator reading this request schema learns that the test request must carry an `attribute`\
    \ name the caller supplies for each value, validated as required content in its own right; a request\
    \ omitting one fails validation before the server ever reaches the placeholder-matching the specification\
    \ reserves to it. The next reader has no reason to suspect the attribute name is meant to come from\
    \ the registered configuration's own placeholders rather than from the caller, because this schema\
    \ treats it exactly like any other operator-authored field."
  observed_at:
  - src/errors/connector-call-address-not-absolute-url.error.ts
  - src/errors/status-map.ts
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for IncompleteConnectorConfigurationError
    — [IncompleteConnectorConfigurationError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: "src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConnectorConfigurationNotFoundError\
    \ — [ConnectorConfigurationNotFoundError, 404],\nsrc/http/test-connector.controller.ts: held at resolveTestedConnectorConfiguration's\
    \ held check — if (!resolution.held) {\n  throw new ConnectorConfigurationNotFoundError(connector);\n\
    }"
  encoded_at:
  - src/errors/status-map.ts
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: true
  how: "src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConnectorPlaceholderOutsideInputSchemaError\
    \ — [ConnectorPlaceholderOutsideInputSchemaError, 422],\nsrc/http/dto/test-connector.dto.ts: held\
    \ at the orphaned_placeholders field of testConnectorResponseSchema, line 63 — orphaned_placeholders:\
    \ z.array(z.string()).readonly(),\nsrc/http/test-connector.controller.ts: held at the orphaned-placeholder\
    \ computation and its inclusion in the diagnostic response, reporting the seam for the pairing under\
    \ test — const orphanedPlaceholderNames = orphanedPlaceholders(configuration.raw.configuration, capability.input_schema);\n\
    return {\n  request: requestEcho(httpFields.method, echoed),\n  response,\n  orphaned_placeholders:\
    \ orphanedPlaceholderNames,\n};"
  encoded_at:
  - src/errors/status-map.ts
  - src/http/dto/test-connector.dto.ts
  - src/http/test-connector.controller.ts
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  conforms: true
  how: "src/http/test-connector.controller.ts: held at resolveTestRequests building the echoed request\
    \ through a redacting env proxy, and requestEcho returning that masked request as the response's echo\
    \ — the masking behavior itself, not the literal text it renders (see finding) — const echoed = resolveConnectorRequest({\
    \ configuration, subject, requester, env: redactingEnv() });\n...\nfunction redactingEnv(): NodeJS.ProcessEnv\
    \ {\n  return new Proxy({} as NodeJS.ProcessEnv, { get: () => REDACTED_CREDENTIAL_MARKER });\n}"
  encoded_at:
  - src/http/test-connector.controller.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — a connector configuration whose call carries a credential placeholder in
    both the address and a header, with those environment variables set to real values, and an httpClient
    that answers a successful HTTP response — against one expected result: the 200 body''s echoed request.address
    and request.headers carry the redaction marker in place of both environment values, with the non-credential
    parts of the call still resolved. The same input against an aborted call closes the ''timed-out''
    outcome; the outcomes the route declares (''response'', ''unreachable'', ''timed-out'', and the address
    refusal) are a finite set, so a test over each with a credential placeholder resolved decides the
    node whole.'
- node: rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
  conforms: true
  how: "src/http/dto/test-connector.dto.ts: held at the 'unreachable' branch of testConnectorOutcomeSchema\
    \ (lines 53-57), together with testConnectorUnreachableErrorSchema (lines 35-39) — no status field\
    \ accompanies this branch, matching \"no response status\" — z.object({\n    kind: z.literal('unreachable'),\n\
    \    error: testConnectorUnreachableErrorSchema,\n    elapsedMs: z.number().nonnegative(),\n  }),\n\
    const testConnectorUnreachableErrorSchema = z.object({\n  code: z.string().min(1),\n  message: z.string().min(1),\n\
    \  details: z.object({ connector: z.string().min(1) }),\n});\nsrc/http/test-connector.controller.ts:\
    \ held at issueOutcome's catch branch and unreachableOutcome — returns a completed 'unreachable' result\
    \ carrying ConnectorUnreachableError and the connector name, no response status, instead of throwing\
    \ a refusal — } catch (error) {\n  return unreachableOutcome(connector, error, Date.now() - startedAt);\n\
    }\n...\nfunction unreachableOutcome(connector: string, cause: unknown, elapsedMs: number): TestConnectorResponseDto['response']\
    \ {\n  const error = new ConnectorUnreachableError(connector, { cause });\n  return {\n    kind: 'unreachable',\n\
    \    error: { code: error.name, message: error.message, details: error.context },\n    elapsedMs,\n\
    \  };\n}"
  encoded_at:
  - src/http/dto/test-connector.dto.ts
  - src/http/test-connector.controller.ts
  decided_by: reading
  remainder: testable
  remainder_why: 'One input — an unreachable run (the client rejecting before any response, with no abort)
    whose registered configuration places credential placeholders in the address, in a query value and
    in the body as well as in a header, and whose call descriptor carries a method, query and body — against
    one expected result: an HTTP 200 answer whose echoed request holds the same address, method, query,
    headers and body a responding run''s echo holds for that configuration, with every value a credential
    placeholder resolved to reading masked in each of those places rather than only in the header.'
- node: rules/integration/a-draft-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for OpenApiDocumentNotFetchedError
    and OpenApiDocumentNotReadableError — [OpenApiDocumentNotFetchedError, 422], [OpenApiDocumentNotReadableError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for OpenApiDocumentNotReadableError
    — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-malformed-or-unsupported-openapi-document-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for OpenApiDocumentNotReadableError
    — [OpenApiDocumentNotReadableError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-openapi-document-declaring-no-such-operation-refuses-the-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for OpenApiOperationNotFoundError
    — [OpenApiOperationNotFoundError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-operations-read-refusal-distinguishes-a-fetch-failure-from-an-unreadable-document
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entries for OpenApiDocumentNotFetchedError
    and OpenApiDocumentNotReadableError — [OpenApiDocumentNotFetchedError, 422], [OpenApiDocumentNotReadableError,
    422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/an-unfetchable-openapi-link-refuses-the-operations-read
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for OpenApiDocumentNotFetchedError
    — [OpenApiDocumentNotFetchedError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for SubjectDoesNotCoverCaseInputsError
    — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for HypothesisNotInManifestError
    — [HypothesisNotInManifestError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for SubjectCarriesNoAttributeError
    — [SubjectCarriesNoAttributeError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for InvestigationWriteDeadlineExceededError
    — [InvestigationWriteDeadlineExceededError, 500],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-version-failing-validation-at-a-read-is-refused-by-name
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for CaseVersionNotValidError
    — [CaseVersionNotValidError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-concept-accepts-the-declared-subject-type
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConceptRefusesSubjectTypeError
    — [ConceptRefusesSubjectTypeError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for HypothesisRevisionCollectsNoConceptError
    — [HypothesisRevisionCollectsNoConceptError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for CaseHoldsNoDraftError —
    [CaseHoldsNoDraftError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for HypothesisRevisionNotDraftAtReleaseError
    — [HypothesisRevisionNotDraftAtReleaseError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/a-released-hypothesis-revision-is-never-altered
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ReleasedHypothesisRevisionNotAlterableError
    — [ReleasedHypothesisRevisionNotAlterableError, 409],'
  encoded_at:
  - src/errors/status-map.ts
- node: rules/knowledge/case-terms-exist-in-the-glossary
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConceptNotInGlossaryError
    — [ConceptNotInGlossaryError, 404],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/glossary/a-concept-with-no-description-is-refused
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for ConceptDescriptionRequiredError
    — [ConceptDescriptionRequiredError, 422],'
  encoded_at:
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: 'src/errors/status-map.ts: held at the STATUS_BY_ERROR_CLASS entry for SubjectDoesNotCoverCaseInputsError
    — [SubjectDoesNotCoverCaseInputsError, 422],'
  encoded_at:
  - src/errors/status-map.ts
unstated:
- file: src/__tests__/unit/http/test-connector.routes.spec.ts
  where: line 370, inside "refuses a test-connector request whose resolved address is not a valid absolute
    URL..."; and line 398, inside "ends a test whose issued call fails before any HTTP response..."
  evidence: 'expect(body.error.details).toEqual({ address: ''***REDACTED***/subjects/subject-value-1''
    });

    ...

    expect(body.request.headers.authorization).toBe(''Bearer ***REDACTED***'');'
  cost: The literal marker a masked credential renders as — the exact string `***REDACTED***` in place
    of the resolved value — is asserted here as a fixed fact of the connector-diagnostics response, but
    rules/integration/a-diagnostic-response-masks-a-resolved-credential only says that masking happens,
    never what the masked value displays as. The one node in the specification that does pin `***REDACTED***`
    (rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked)
    scopes to domain/investigation/evidence, a different aggregate, and its own decision log entry justifies
    that choice by pointing at this connector's controller code as precedent rather than deciding it independently
    for connector diagnostics. A reader who wants to know what an operator actually sees in place of a
    secret on this route has to read this test or the controller, not the specification, and nothing keeps
    this literal in step with the sibling rendering if either is changed on its own.
- file: src/http/dto/test-connector.dto.ts
  where: the 'timed-out' branch of testConnectorOutcomeSchema (lines 49-52)
  evidence: "z.object({\n    kind: z.literal('timed-out'),\n    elapsedMs: z.number().nonnegative(),\n\
    \  }),"
  cost: An integrator reading this schema learns that the diagnostic can answer with a distinct "timed-out"
    outcome carrying nothing but an elapsed duration — no status, no error code, no connector name — as
    though that shape were settled. The one node in this file's set that describes what a completed diagnostic
    test answers says explicitly that a capability timeout's own abort is "Not decided here", so this
    shape is a decision the specification never made, and the next reader who wants to know what a timed-out
    test reports will find it only in this file rather than in the specification.
- file: src/http/test-connector.controller.ts
  where: line 22, the REDACTED_CREDENTIAL_MARKER constant, and its use inside redactingEnv() (lines 108-110)
    to mask every credential placeholder in the diagnostic's echoed request
  evidence: const REDACTED_CREDENTIAL_MARKER = '***REDACTED***';
  cost: This file is the sole place that fixes what an operator actually sees in place of a masked credential
    on the diagnostic read — the wording a reader would take as the specification's own decision. The
    specification's own decision log records, for a sibling masking rule (rules/investigation/a-presented-evidence-items-inputs-are-shown-with-a-resolved-credential-masked),
    that it only reused this same text as precedent and explicitly "claims nothing about" whether the
    diagnostic's own response carries it, and separately that "rules/integration/a-diagnostic-response-masks-a-resolved-credential
    fixes that its own read masks and fixes no rendering for it" and that "no node in the specification
    states any masking rendering at all" for this read. A reviewer who wants to know what an operator
    actually reads in place of a masked value on this endpoint has nowhere to look but this constant,
    and changing it would change operator-facing behavior with nothing in the specification to check it
    against.
unbound:
- src/__tests__/unit/http/test-connector.routes.spec.ts
notes: 'Judged by 5 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/test-connector-request-echo-url-hotfix.returns/.

  Certification of rules/integration/a-diagnostic-response-masks-a-resolved-credential did not hold: the
  auditor answered `partial` — Masking of a resolved credential is asserted against a real environment
  value in two places only, and neither is the echo the diagnostic ordinarily returns. The unreachable
  test puts `${credential:UNREACHABLE_HOTFIX_TOKEN}` in a header, sets it to ''another-real-secret'',
  and asserts body.request.headers.authorization is ''Bearer ***REDACTED***'' — that assertion would fail
  if masking stopped holding on the unreachable outcome. The 422 test masks `${credential:ADDRESS_HOTFIX_TOKEN}`
  in the address, but in the error details of a refusal that issues no call, not in a response echoing
  a call back. Nothing in the named set resolves a credential placeholder on a call that reaches an HTTP
  response: the two tests that read body.request on the ''response'' outcome (''returns the raw HTTP status,
  headers, body and elapsed time...'' and ''issues the exact request resolveConnectorRequest assembles...'')
  use a configuration with no credential placeholder at all, so they cannot detect a real value surviving
  into that echo, and the ''timed-out'' outcome''s echo is never read. The node''s fact is stated over
  the response echoing the call back; masking that held on the unreachable branch and failed on the ordinary
  one would leave every named test passing. Separately, no named test asserts that a credential resolved
  into the address is masked in the echoed body.request.address — only in a refusal''s details.. The node
  is decided by reading, and a certification standing on it from an earlier reconciliation is released
  by the bind. The remainder is testable: One input — a connector configuration whose call carries a credential
  placeholder in both the address and a header, with those environment variables set to real values, and
  an httpClient that answers a successful HTTP response — against one expected result: the 200 body''s
  echoed request.address and request.headers carry the redaction marker in place of both environment values,
  with the non-credential parts of the call still resolved. The same input against an aborted call closes
  the ''timed-out'' outcome; the outcomes the route declares (''response'', ''unreachable'', ''timed-out'',
  and the address refusal) are a finite set, so a test over each with a credential placeholder resolved
  decides the node whole..

  Certification of rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test
  did not hold: the auditor answered `partial` — Three of the fact''s four parts are exercised whole and
  would fail if they stopped holding: the answer status (a rejected call answers 200, asserted directly,
  so a 4xx or 5xx would fail), the ConnectorUnreachableError together with the connector''s name (asserted
  as an exact equality on the error code and on details being the connector alone), and the absence of
  a response status (asserted as `''status'' in body.response` being false, so a status filled in anyway
  would fail). The boundary the description reserves — the capability''s own deliberate abort — is held
  apart by the timeout test, which would fail if an AbortError began answering as unreachable. The fourth
  part is exercised only in part. The fact states that the answer "carries back the same echoed request
  a test answered by a response carries, with every value a credential placeholder resolved to masked",
  and on the unreachable path the set asserts only the echoed address and one header whose value came
  from a credential placeholder. Nothing asserts that the echo an unreachable run carries is the same
  echo a responding run carries: no test compares the two, and the unreachable run asserts nothing about
  the method, query or body the echo holds, so an implementation that dropped those from the echo on this
  one path would leave every named test passing. Nor is the masking totality exercised on this path: the
  configuration under the unreachable test places its only credential placeholder in a header, its address
  and body carrying none, so a resolved credential reaching the operator unmasked in the echoed address,
  query or body of an unreachable run would fail nothing. The 422 test does mask a credential in a resolved
  address, but it exercises the refusal that issues no call at all, which is a different behavior and
  not this fact''s path.. The node is decided by reading, and a certification standing on it from an earlier
  reconciliation is released by the bind. The remainder is testable: One input — an unreachable run (the
  client rejecting before any response, with no abort) whose registered configuration places credential
  placeholders in the address, in a query value and in the body as well as in a header, and whose call
  descriptor carries a method, query and body — against one expected result: an HTTP 200 answer whose
  echoed request holds the same address, method, query, headers and body a responding run''s echo holds
  for that configuration, with every value a credential placeholder resolved to reading masked in each
  of those places rather than only in the header..

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) contracts/integration/connector-diagnostics,
  rules/integration/a-connector-configuration-is-tested-through-a-registered-capability, rules/integration/a-diagnostic-response-masks-a-resolved-credential,
  rules/integration/a-diagnostic-test-of-an-unreachable-connector-answers-as-a-completed-test were read
  on every file and answered for, and bound from nowhere here — a binding this record writes is one the
  trace already held.

  Candidates: 6 opened across 1 of 5 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 3 fact(s) the source states that no node holds, over 3 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/test-connector-request-echo-url-hotfix.returns/`, which are the evidence behind every entry above.
