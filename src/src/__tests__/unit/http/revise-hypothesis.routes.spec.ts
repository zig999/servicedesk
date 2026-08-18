// Proof for task/case-lifecycle-http/revise-hypothesis-route: POST
// /v1/cases/{slug}/hypotheses exercised through Fastify's own app.inject()
// against a local instance registering createReviseHypothesisRoutesPlugin()
// and error-handler.middleware.ts's own handleUnexpectedError directly — the
// same shape create-draft.routes.spec.ts already establishes for a
// 201-on-success write route with a single dependency, adapted for this
// route's own :slug path segment plus a full body.
// CaseLifecycleOperations['reviseHypothesis'] is a stand-in here (TST-03 — a
// stand-in replaces a boundary, never business logic):
// revise-hypothesis.operation.ts's own ReviseHypothesisOperation, which
// decides the empty-collects, unknown-concept and subject-refusal checks and
// delegates identity-claim and numbering to the case store beneath it, is
// proved separately in its own unit spec. This file proves only that the
// route, controller and DTO carry that operation's promise onto the wire
// unchanged — including the one promise this task's own DTO header comment
// singles out as its own disclosed inference: collects is validated as an
// array of non-empty strings without a top-level non-empty requirement,
// because rules/knowledge/a-hypothesis-collects-at-least-one-concept is
// already a typed, contextful refusal the domain operation itself raises, so
// this boundary must not intercept an empty collects array with a generic
// 400 before that refusal is ever reached.
//
// Criterion 3 ("A request naming a case slug that does not exist is refused
// with the status status-map assigns CaseNotFoundError") is not proved here.
// Tracing the call graph this route delegates to: revise-hypothesis.operation.ts's
// own refuseWithoutDraft calls ICaseStore.findDraftVersion(slug), which
// returns undefined both for a slug the "cases" table holds no row for and
// for an existing case currently holding no draft — both throw
// CaseHoldsNoDraftError, never CaseNotFoundError, and CaseHoldsNoDraftError
// has no entry in src/errors/status-map.ts, so it falls through to the
// generic 500 handler rather than the 404 this criterion states. Writing a
// test asserting a 404 here would fail against the real call graph, and a
// test asserting the actual 500 would misrepresent it as what the criterion
// requires; neither belongs in this file, so the gap is recorded in this
// proof's own `untested` instead.

import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it, vi } from 'vitest';
import type { CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import type { RevisedHypothesis } from '../../../case/revise-hypothesis.operation.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';
import type { ReviseHypothesisControllerDependencies } from '../../../http/revise-hypothesis.controller.js';
import { createReviseHypothesisRoutesPlugin } from '../../../http/revise-hypothesis.routes.js';
import type { ReviseHypothesisBodyDto } from '../../../http/dto/revise-hypothesis.dto.js';

type ReviseHypothesisMock = ReturnType<typeof vi.fn<CaseLifecycleOperations['reviseHypothesis']>>;

/** A full, valid revise-hypothesis request body, every one of reviseHypothesisBodySchema's required attributes present. */
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

/** One Fastify instance registering exactly this route plugin plus the shared error handler — mirrors create-draft.routes.spec.ts's own buildTestApp. */
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

// ------------------------------------------------------------------ criterion 1

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

// ------------------------------------------------------------------ criterion 2

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

// ------------------------------------------------------------------ edge cases (COR-04)

it('answers the unchanged generic envelope, never a partial body or leaked detail, when reviseHypothesis rejects with a generic, non-domain error', async () => {
  const built = buildTestApp();
  app = built.app;
  built.reviseHypothesis.mockRejectedValueOnce(new Error('a sensitive internal detail nobody outside the server should see'));

  const response = await app.inject({ method: 'POST', url: '/v1/cases/a-slug/hypotheses', payload: validReviseHypothesisBody() });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
  expect(response.body).not.toContain('a sensitive internal detail nobody outside the server should see');
});
