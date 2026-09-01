import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import type { RevisedHypothesis } from '../../../case/revise-hypothesis.operation.js';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReviseHypothesisControllerDependencies } from '../../../http/revise-hypothesis.controller.js';
import { createReviseHypothesisRoutesPlugin } from '../../../http/revise-hypothesis.routes.js';
import type { ReviseHypothesisBodyDto } from '../../../http/dto/revise-hypothesis.dto.js';

type ReviseHypothesisMock = ReturnType<typeof vi.fn<CaseLifecycleOperations['reviseHypothesis']>>;

function validReviseHypothesisBody(overrides: Partial<ReviseHypothesisBodyDto> = {}): ReviseHypothesisBodyDto {
  return {
    hypothesis_name: 'a-hypothesis',
    criterion: 'a-criterion',
    collects: ['a-concept'],
    resolution: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
    subject: 'a-subject',
    ...overrides,
  };
}

function buildTestApp(): { app: FastifyInstance; reviseHypothesis: ReviseHypothesisMock } {
  const reviseHypothesis: ReviseHypothesisMock = vi.fn();
  const dependencies: ReviseHypothesisControllerDependencies = { reviseHypothesis };
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.register(createReviseHypothesisRoutesPlugin(dependencies));
  return { app, reviseHypothesis };
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

it('answers 201 with the hypothesis_name and revision reviseHypothesis originated, calling reviseHypothesis with exactly the path slug merged onto the parsed body, for a hypothesis named for the first time', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validReviseHypothesisBody({ hypothesis_name: 'a-new-hypothesis' });
  const revised: RevisedHypothesis = { hypothesis_name: 'a-new-hypothesis', revision: 1 };
  built.reviseHypothesis.mockResolvedValueOnce(revised);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: body });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(revised);
  expect(built.reviseHypothesis).toHaveBeenCalledWith({ slug: 'a-slug', ...body });
});

it('answers 201 with the next revision number reviseHypothesis originated, calling reviseHypothesis with the same exact shape, when revising an already-existing hypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validReviseHypothesisBody({ hypothesis_name: 'an-existing-hypothesis' });
  const revised: RevisedHypothesis = { hypothesis_name: 'an-existing-hypothesis', revision: 5 };
  built.reviseHypothesis.mockResolvedValueOnce(revised);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: body });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(revised);
  expect(built.reviseHypothesis).toHaveBeenCalledWith({ slug: 'a-slug', ...body });
});

it('answers 400 for a body missing the required criterion attribute, without ever reaching reviseHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validReviseHypothesisBody();
  const bodyWithoutCriterion = {
    hypothesis_name: fullBody.hypothesis_name,
    collects: fullBody.collects,
    resolution: fullBody.resolution,
    subject: fullBody.subject,
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: bodyWithoutCriterion });

  expect(response.statusCode).toBe(400);
  expect(built.reviseHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a body missing the required hypothesis_name attribute, without ever reaching reviseHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const fullBody = validReviseHypothesisBody();
  const bodyWithoutHypothesisName = {
    criterion: fullBody.criterion,
    collects: fullBody.collects,
    resolution: fullBody.resolution,
    subject: fullBody.subject,
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: bodyWithoutHypothesisName });

  expect(response.statusCode).toBe(400);
  expect(built.reviseHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a malformed resolution whose referral is missing its required recipient, without ever reaching reviseHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const malformedBody = {
    ...validReviseHypothesisBody(),
    resolution: { outcome: 'an-outcome', referral: { action: 'an-action' } },
  };

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: malformedBody });

  expect(response.statusCode).toBe(400);
  expect(built.reviseHypothesis).not.toHaveBeenCalled();
});

it('answers 400 for a collects array containing an empty-string entry, without ever reaching reviseHypothesis', async () => {
  const built = buildTestApp();
  app = built.app;
  const malformedBody = validReviseHypothesisBody({ collects: ['a-concept', ''] });

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: malformedBody });

  expect(response.statusCode).toBe(400);
  expect(built.reviseHypothesis).not.toHaveBeenCalled();
});

it('succeeds, calling reviseHypothesis with an empty collects array rather than refusing it at the validation boundary, since the domain operation raises its own typed refusal for an empty collects', async () => {
  const built = buildTestApp();
  app = built.app;
  const body = validReviseHypothesisBody({ collects: [] });
  const revised: RevisedHypothesis = { hypothesis_name: body.hypothesis_name, revision: 1 };
  built.reviseHypothesis.mockResolvedValueOnce(revised);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: body });

  expect(response.statusCode).toBe(201);
  expect(built.reviseHypothesis).toHaveBeenCalledWith({ slug: 'a-slug', ...body });
});

it(
  'answers 400 via validation for a request with an empty :slug segment, never 404 "route not found" — Fastify still matches the ' +
    'route with an empty string param for this segment, and reviseHypothesisParamsSchema (z.string().min(1)) is what refuses it',
  async () => {
    const built = buildTestApp();
    app = built.app;

    const response = await app.inject({ method: 'POST', url: '/v1/cases//hypotheses', payload: validReviseHypothesisBody() });

    expect(response.statusCode).toBe(400);
    expect(built.reviseHypothesis).not.toHaveBeenCalled();
  },
);

it('answers the unchanged generic envelope, never a partial body or leaked detail, when reviseHypothesis rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.reviseHypothesis.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a sensitive internal detail nobody outside the server should see');
});

it("answers 409 with CaseHoldsNoDraftError's own code, message and context as details, never the generic 500, when reviseHypothesis rejects with it", async () => {
  const built = buildTestApp();
  app = built.app;
  const error = new CaseHoldsNoDraftError('a-slug');
  built.reviseHypothesis.mockRejectedValueOnce(error);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(409);
  expect(response.json()).toEqual({ error: { code: 'CaseHoldsNoDraftError', message: error.message, details: error.context } });
});

it("answers 404 with ConceptNotInGlossaryError's own code, message and context as details, never the generic 500, when reviseHypothesis rejects with it", async () => {
  const built = buildTestApp();
  app = built.app;
  const error = new ConceptNotInGlossaryError('a-slug', 'a-hypothesis', ['an-unknown-concept']);
  built.reviseHypothesis.mockRejectedValueOnce(error);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(404);
  expect(response.json()).toEqual({ error: { code: 'ConceptNotInGlossaryError', message: error.message, details: error.context } });
});

it("answers 422 with HypothesisRevisionCollectsNoConceptError's own code, message and context as details, never the generic 500, when reviseHypothesis rejects with it", async () => {
  const built = buildTestApp();
  app = built.app;
  const error = new HypothesisRevisionCollectsNoConceptError('a-slug', 'a-hypothesis');
  built.reviseHypothesis.mockRejectedValueOnce(error);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(422);
  expect(response.json()).toEqual({ error: { code: 'HypothesisRevisionCollectsNoConceptError', message: error.message, details: error.context } });
});

it("answers 422 with ConceptRefusesSubjectTypeError's own code, message and context as details, never the generic 500, when reviseHypothesis rejects with it", async () => {
  const built = buildTestApp();
  app = built.app;
  const error = new ConceptRefusesSubjectTypeError({
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    subject: 'a-subject-type',
    concepts: ['a-concept'],
  });
  built.reviseHypothesis.mockRejectedValueOnce(error);

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(422);
  expect(response.json()).toEqual({ error: { code: 'ConceptRefusesSubjectTypeError', message: error.message, details: error.context } });
});
