---
title: Read a case version's input requirements -- hook proof
summary: Ten renderHook-driven tests proving all six of this task's criteria for useCaseInputRequirements(slug,
  version) -- the URL it reads, the requirement and bare-capability shapes it returns, the malformed-input-schema
  list's separation, the empty-vs-error distinction, and the loading/error/refetch shape -- plus the query-key
  inference the implementation recorded.
implementation: sha256:bf4e9f137651ea54078a416f6e16e0de766c6c45d4965acb6f703fe8d83ee845
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/subject-input-requirements-read-case-input-requirements-hook-suite
tests:
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- reading the published operation through apiFetch (criterion 1) > reads
    GET /v1/cases/{slug}/versions/{version}/input-requirements, with the exact slug (encoded) and version
    given interpolated
  proves: criterion 1 -- the hook reads the exact URL, slug and version interpolated, through apiFetch
  fails_when: the hook fetches any URL other than /v1/cases/{encoded-slug}/versions/{version}/input-requirements
    -- stubFetch throws for an unmatched URL, the query rejects, and isError would read true (or requirements
    would not equal the mocked payload) instead of the assertions holding
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- each requirement carrying its own attribute, required flag and capabilities
    (criterion 2) > returns every requirement's own attribute name, required flag and asking capabilities,
    unmodified
  proves: criterion 2 -- each requirement carries its own attribute, required and capabilities
  fails_when: any of attribute, required or capabilities is dropped, renamed, coerced or transposed between
    the two mocked requirements
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- a requirement's capabilities carried by bare name/version identity
    alone (criterion 3) > returns each capability as exactly {name, version}, restating none of its other
    registration fields
  proves: criterion 3 -- a requirement's capabilities are bare {name, version}, nothing else restated
  fails_when: the returned capability object carries any own key besides name/version (e.g. the requirement's
    own attribute restated onto it), or its name/version value differs from the mocked source
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- capabilitiesWithMalformedInputSchema kept as its own separate list
    (criterion 4) > never merges the malformed-input-schema capabilities into any requirement's own capabilities
  proves: criterion 4 -- the malformed-input-schema capabilities are their own list, never merged into
    any requirement's capabilities
  fails_when: the malformed capability (CAPABILITY_B) appears inside the requirement's own capabilities
    array, or capabilitiesWithMalformedInputSchema does not equal the mocked malformed list on its own
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- a malformed-schema capability named by bare identity alone (UNDERDETERMINED
    note) > returns each capabilitiesWithMalformedInputSchema entry as exactly {name, version}, restating
    none of its nature, connector, schemas, timeout or answered concept
  proves: the task's UNDERDETERMINED note -- a passing implementation must not restate a malformed capability's
    nature, connector, schemas, timeout or concept alongside its name and version
  fails_when: a malformed-list entry carries any own key besides name/version
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- an empty requirements response (criterion 5) > resolves an empty requirement
    list rather than an error state when the read answers none
  proves: criterion 5 -- an empty requirements response returns an empty list rather than an error state
  fails_when: requirements is anything other than [] once loading settles, or isError reads true for a
    genuinely empty successful response
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- a failed read is never presented as an empty successful one (criterion
    5, vice versa) > reports isError true, not merely an empty requirements list, when the GET itself
    fails
  proves: criterion 5's vice-versa half -- isLoading/isError are not confused with a genuinely empty successful
    response, i.e. a real failure is not silently read as one
  fails_when: isError stays false after the GET responds 500, or requirements is populated instead of
    falling back to []
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- the loading state before the GET resolves (criterion 6) > reports
    isLoading true before the GET resolves, then false once it does
  proves: criterion 6 -- the hook reports its own loading state
  fails_when: isLoading is false before the pending GET resolves, or stays true after it resolves
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- refetch reissues the GET and returns void (criterion 6) > issues a
    new GET when refetch is called, and refetch itself returns void
  proves: criterion 6 -- refetch is void-returning and reissues the read
  fails_when: calling refetch() does not increase the fetch mock's call count, or its return value is
    not undefined (e.g. it returns query.refetch()'s own Promise unwrapped)
- file: src/hooks/use-case-input-requirements.spec.ts
  name: useCaseInputRequirements -- issuing its own GET, independent of another hook's differently-keyed
    cache entry (an inference the implementation recorded) > resolves from its own GET rather than a case-version
    cache entry an existing hook already populated for this same (slug, version)
  proves: the recorded inference that this hook uses its own dedicated query key (["case-input-requirements",
    slug, version]) rather than reusing use-case-simulation-version.ts's own ["case-version", slug, version]
    key
  fails_when: 'the hook reads the seeded ["case-version", slug, version] cache entry instead of issuing
    (and consuming) its own GET -- the ready result would then carry {from: "case-version-cache"} rather
    than the mocked response''s own requirements'
not_applicable:
- edge_case: conditioning behavior on the case version's draft/released status
  why: contracts/knowledge/case-input-requirements and this task's own Notes state the read answers for
    either state with no conditional of its own; the hook receives no status argument to vary, so there
    is no dimension at the hook's own boundary a test could exercise here -- the implementation's absence
    of any branch is what the criterion asks for, and no mock can make an omitted branch present.
- edge_case: malformed or boundary slug/version arguments (empty slug, non-positive version)
  why: neither this task's criteria nor the implementation record declare any client-side validation of
    these parameters; :slug/:version validation belongs to the backend's own DTO (caseInputRequirementsParamsSchema
    in case-input-requirements.dto.ts), so a test asserting a client-side refusal here would test a boundary
    this hook does not own.
- edge_case: two overlapping calls to refetch, or two mounts of the hook for the same (slug, version)
    at once
  why: react-query's own request de-duplication and in-flight-query handling owns that behavior; no criterion
    of this task asks the hook to arbitrate it itself, and testing it would bind the test to react-query's
    own internals rather than this hook's behavior.
- edge_case: duplicate attribute entries, or the same capability identity appearing twice in one response
  why: rules/knowledge/a-case-versions-input-requirements-are-derived places deriving and deduplicating
    the requirements list on the backend; this hook only reads and forwards what the response states,
    so a duplicate in the wire payload is not a behavior this hook's own criteria ask it to resolve.
untested:
- Whether the hook would strip an unexpected extra field (nature, connector, timeout, etc.) from a capability
  reference if the wire response ever carried one -- the implementation forwards query.data's own capabilities/capabilities_with_malformed_input_schema
  arrays unchanged rather than picking name/version out of a wider object, so its bare-identity guarantee
  rests entirely on the backend's own zod schema (capabilityIdentitySchema, which strips unknown keys
  on parse) never sending more. Every test mocks a wire response that already matches that real contract
  shape; feeding an extra-field capability would test the backend's schema rather than this hook, but
  that also means no test here would catch a regression if this hook itself started reading a wider capability
  shape instead of the bare one the response provides.
---

## What it is
Ten tests over a new hook file, proving all six of the task's criteria plus one UNDERDETERMINED note and one recorded inference, mocking apiFetch at the fetch boundary the same way sibling hook specs already do.

## Notes
None.
