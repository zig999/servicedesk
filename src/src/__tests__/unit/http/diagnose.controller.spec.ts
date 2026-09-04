import { expect, it, vi } from 'vitest';
import type { Case, ManifestEntry, Resolution } from '../../../case/case.js';
import type { CaseInputRequirement, CaseInputRequirementsResult } from '../../../case/case-input-requirements.js';
import type { ICaseInputRequirementsQuery } from '../../../case/case-input-requirements.port.js';
import type { ICaseQuery, ReadCaseResult } from '../../../case/case-query.port.js';
import { CaseVersionNotReleasedError } from '../../../errors/case-version-not-released.error.js';
import { SubjectDoesNotCoverCaseInputsError } from '../../../errors/subject-does-not-cover-case-inputs.error.js';
import type { ProductionDiagnoseCall } from '../../../factories/production-diagnose.factory.js';
import { handleDiagnoseRequest, type DiagnoseControllerDependencies } from '../../../http/diagnose.controller.js';
import type { DiagnoseRequestDto, DiagnoseResponseDto } from '../../../http/dto/diagnose.dto.js';
import type { Assessment } from '../../../investigation/assessment.js';

function heldResolution(outcome = 'an-outcome'): Resolution {
  return { outcome, referral: { action: 'an-action', recipient: 'a-recipient' } };
}

function heldManifestEntry(position: number, hypothesisName: string): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesisName },
      revision: 1,
      criterion: 'a-criterion',
      collects: ['a-concept'],
      resolution: heldResolution(),
    },
  };
}

function heldCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'a-title',
    when_to_use: 'when an attendant needs it',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject',
    fallback: heldResolution('no-hypothesis-confirmed'),
    state: 'released',
    manifest: [heldManifestEntry(1, 'hypothesis-a')],
    hypotheses: [{ name: 'hypothesis-a', criterion: 'a-criterion', collects: ['a-concept'], resolution: heldResolution() }],
    ...overrides,
  };
}

const REQUEST_BODY: DiagnoseRequestDto = {
  case: { slug: 'a-slug', version: 1 },
  subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
  narrative: 'a customer reports a fault',
  requester: 'a-requester',
};

type ReadCaseMock = ReturnType<typeof vi.fn<(slug: string, version: number) => Promise<ReadCaseResult>>>;
type RunDiagnoseMock = ReturnType<typeof vi.fn<(call: ProductionDiagnoseCall) => Promise<Assessment>>>;
type ReadCaseInputRequirementsMock = ReturnType<
  typeof vi.fn<(slug: string, version: number) => Promise<CaseInputRequirementsResult>>
>;

function noRequirements(): CaseInputRequirementsResult {
  return { requirements: [], capabilities_with_malformed_input_schema: [] };
}

function buildDependencies(
  readCaseResult: ReadCaseResult,
  requirementsResult: CaseInputRequirementsResult = noRequirements(),
): {
  dependencies: DiagnoseControllerDependencies;
  readCase: ReadCaseMock;
  runDiagnose: RunDiagnoseMock;
  readCaseInputRequirements: ReadCaseInputRequirementsMock;
} {
  const readCase: ReadCaseMock = vi.fn().mockResolvedValue(readCaseResult);
  const runDiagnose: RunDiagnoseMock = vi.fn();
  const readCaseInputRequirements: ReadCaseInputRequirementsMock = vi.fn().mockResolvedValue(requirementsResult);
  const caseQuery: ICaseQuery = {
    readCase,
    listCases: vi.fn(),
    listCaseVersions: vi.fn(),
    listHypotheses: vi.fn(),
    listHypothesisRevisions: vi.fn(),
  };
  const caseInputRequirementsQuery: ICaseInputRequirementsQuery = { readCaseInputRequirements };
  const dependencies: DiagnoseControllerDependencies = {
    caseQuery,
    caseInputRequirementsQuery,
    runDiagnose,
    model: 'a-configured-model',
    promptVersion: 'a-configured-prompt-version',
  };
  return { dependencies, readCase, runDiagnose, readCaseInputRequirements };
}

it('refuses a diagnose request naming a draft-state pinned case version by throwing exactly a CaseVersionNotReleasedError', async () => {
  const { dependencies } = buildDependencies({ case: heldCase({ state: 'draft' }) });

  const rejection = handleDiagnoseRequest(dependencies, REQUEST_BODY);

  await expect(rejection).rejects.toBeInstanceOf(CaseVersionNotReleasedError);
});

it("names the pinned case's own slug, version and state on the thrown refusal, rather than a fixed or unrelated value", async () => {
  const { dependencies } = buildDependencies({ case: heldCase({ slug: 'a-different-slug', version: 4, state: 'draft' }) });

  const rejection = handleDiagnoseRequest(dependencies, { ...REQUEST_BODY, case: { slug: 'a-different-slug', version: 4 } });

  await expect(rejection).rejects.toMatchObject({
    context: { slug: 'a-different-slug', version: 4, state: 'draft' },
  });
});

it('reads the pinned case through readCase, by the request\'s own slug and version, before refusing it', async () => {
  const { dependencies, readCase } = buildDependencies({ case: heldCase({ slug: 'a-slug', version: 7, state: 'draft' }) });

  await expect(handleDiagnoseRequest(dependencies, { ...REQUEST_BODY, case: { slug: 'a-slug', version: 7 } })).rejects.toThrow(
    CaseVersionNotReleasedError,
  );

  expect(readCase).toHaveBeenCalledWith('a-slug', 7);
});

it('never calls runDiagnose — the sole entry into collection, judgment and writing — for a draft-state pinned version, so none of the three ever starts', async () => {
  const { dependencies, runDiagnose } = buildDependencies({ case: heldCase({ state: 'draft' }) });

  await expect(handleDiagnoseRequest(dependencies, REQUEST_BODY)).rejects.toThrow(CaseVersionNotReleasedError);

  expect(runDiagnose).not.toHaveBeenCalled();
});

it('never queries the case-input-requirements for a draft-state pinned version, so the existing released-state refusal still runs first', async () => {
  const { dependencies, readCaseInputRequirements } = buildDependencies({ case: heldCase({ state: 'draft' }) });

  await expect(handleDiagnoseRequest(dependencies, REQUEST_BODY)).rejects.toThrow(CaseVersionNotReleasedError);

  expect(readCaseInputRequirements).not.toHaveBeenCalled();
});

function releasedDiagnoseRequestBody(): DiagnoseRequestDto {
  return {
    case: { slug: 'a-released-slug', version: 2 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    narrative: 'a customer reports a fault',
    requester: 'a-requester',
    ticket_ref: 'TCK-1',
  };
}

type AssembledCallExpectation = {
  releasedCase: Case;
  body: DiagnoseRequestDto;
  expectedAssessment: Assessment;
  expectedResponse: DiagnoseResponseDto;
};

function expectRunDiagnoseCalledOnceAndAssembled(
  runDiagnose: RunDiagnoseMock,
  expectation: AssembledCallExpectation,
  result: DiagnoseResponseDto,
): void {
  const { releasedCase, body, expectedResponse } = expectation;
  expect(runDiagnose).toHaveBeenCalledTimes(1);
  const call = runDiagnose.mock.calls[0]?.[0];
  expect(call).toMatchObject({
    requester: 'a-requester',
    ticket_ref: 'TCK-1',
    narrative: 'a customer reports a fault',
    subjectType: 'a-subject-type',
    subjectAttributes: body.subject.attributes,
    case: releasedCase,
    prompt_version: 'a-configured-prompt-version',
    model: 'a-configured-model',
  });
  expect(call).not.toHaveProperty('cost');
  expect(call).not.toHaveProperty('durations');
  expect(typeof call?.id).toBe('string');
  expect((call?.id ?? '').length).toBeGreaterThan(0);
  expect(result).toEqual(expectedResponse);
}

it('proceeds exactly as before for a released-state pinned version: calls runDiagnose once with every field assembled unchanged, and answers with the resolved Assessment narrowed to the response DTO\'s four fields', async () => {
  const releasedCase = heldCase({ slug: 'a-released-slug', version: 2, state: 'released' });
  const { dependencies, runDiagnose } = buildDependencies({ case: releasedCase });
  const expectedAssessment: Assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a drafted prompt',
  };
  runDiagnose.mockResolvedValueOnce(expectedAssessment);
  const body = releasedDiagnoseRequestBody();
  const expectedResponse: DiagnoseResponseDto = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
  };

  const result = await handleDiagnoseRequest(dependencies, body);

  expectRunDiagnoseCalledOnceAndAssembled(runDiagnose, { releasedCase, body, expectedAssessment, expectedResponse }, result);
});

const A_REQUIRED_CAPABILITY = { name: 'equipment-status-lookup', version: '1.0.0' };

function requirementsWith(...entries: CaseInputRequirement[]): CaseInputRequirementsResult {
  return { requirements: entries, capabilities_with_malformed_input_schema: [] };
}

function bodyWithUnrelatedSubjectAttribute(): DiagnoseRequestDto {
  return { ...REQUEST_BODY, subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-unrelated-attribute', value: 'a-value' }] } };
}

it('refuses a diagnose request whose subject leaves a required case input missing, throwing exactly a SubjectDoesNotCoverCaseInputsError', async () => {
  const requirements = requirementsWith({ attribute: 'contract-number', required: true, capabilities: [A_REQUIRED_CAPABILITY] });
  const { dependencies } = buildDependencies({ case: heldCase({ state: 'released' }) }, requirements);

  const rejection = handleDiagnoseRequest(dependencies, bodyWithUnrelatedSubjectAttribute());

  await expect(rejection).rejects.toBeInstanceOf(SubjectDoesNotCoverCaseInputsError);
});

it('never calls runDiagnose when the subject fails to cover a required case input, so no capability is ever called', async () => {
  const requirements = requirementsWith({ attribute: 'contract-number', required: true, capabilities: [A_REQUIRED_CAPABILITY] });
  const { dependencies, runDiagnose } = buildDependencies({ case: heldCase({ state: 'released' }) }, requirements);

  await expect(handleDiagnoseRequest(dependencies, bodyWithUnrelatedSubjectAttribute())).rejects.toThrow(SubjectDoesNotCoverCaseInputsError);

  expect(runDiagnose).not.toHaveBeenCalled();
});

it("reads the case-input-requirements by the pinned case's own slug and version, not a fixed or unrelated value", async () => {
  const releasedCase = heldCase({ slug: 'a-different-slug', version: 9, state: 'released' });
  const { dependencies, runDiagnose, readCaseInputRequirements } = buildDependencies({ case: releasedCase });
  runDiagnose.mockResolvedValueOnce({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a prompt',
  });

  await handleDiagnoseRequest(dependencies, { ...REQUEST_BODY, case: { slug: 'a-different-slug', version: 9 } });

  expect(readCaseInputRequirements).toHaveBeenCalledWith('a-different-slug', 9);
});

it('names every missing required attribute together with the capabilities that require it, on the refusal thrown by the controller', async () => {
  const secondCapability = { name: 'network-outage-check', version: '2.0.0' };
  const requirements = requirementsWith(
    { attribute: 'contract-number', required: true, capabilities: [A_REQUIRED_CAPABILITY] },
    { attribute: 'service-area', required: true, capabilities: [secondCapability] },
  );
  const { dependencies } = buildDependencies({ case: heldCase({ state: 'released' }) }, requirements);

  let caught: unknown;
  try {
    await handleDiagnoseRequest(dependencies, bodyWithUnrelatedSubjectAttribute());
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(SubjectDoesNotCoverCaseInputsError);
  expect((caught as SubjectDoesNotCoverCaseInputsError).context.missing).toEqual([
    { attribute: 'contract-number', capabilities: [A_REQUIRED_CAPABILITY] },
    { attribute: 'service-area', capabilities: [secondCapability] },
  ]);
});

it('does not refuse a subject missing only an attribute the derived requirements leave optional, and answers with the resolved Assessment narrowed to the response DTO\'s four fields', async () => {
  const requirements = requirementsWith({ attribute: 'a-nice-to-have-attribute', required: false, capabilities: [A_REQUIRED_CAPABILITY] });
  const { dependencies, runDiagnose } = buildDependencies({ case: heldCase({ state: 'released' }) }, requirements);
  const resolvedAssessment: Assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a prompt',
  };
  runDiagnose.mockResolvedValueOnce(resolvedAssessment);

  const result = await handleDiagnoseRequest(dependencies, bodyWithUnrelatedSubjectAttribute());

  expect(result).toEqual({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
  });
});

it('reaches runDiagnose when the subject covers every required attribute the derived requirements name, and answers with the resolved Assessment narrowed to the response DTO\'s four fields', async () => {
  const requirements = requirementsWith({ attribute: 'an-attribute', required: true, capabilities: [A_REQUIRED_CAPABILITY] });
  const { dependencies, runDiagnose } = buildDependencies({ case: heldCase({ state: 'released' }) }, requirements);
  const resolvedAssessment: Assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
    register: 'plain',
    usage: { input_tokens: 0, output_tokens: 0 },
    elapsed_ms: 0,
    prompt: 'a prompt',
  };
  runDiagnose.mockResolvedValueOnce(resolvedAssessment);

  const result = await handleDiagnoseRequest(dependencies, REQUEST_BODY);

  expect(runDiagnose).toHaveBeenCalledTimes(1);
  expect(result).toEqual({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a text',
  });
});
