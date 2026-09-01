// Proof for task/case-lifecycle-http/status-map: error-handler.middleware.ts
// now consults src/errors/status-map.ts before falling back to 500, exercised
// through a real Fastify instance and app.inject() rather than a hand-rolled
// FastifyReply stand-in (TST-03 — a stand-in replaces a boundary, and a
// minimal, throwing Fastify app is the boundary itself, not a substitute for
// it), the same convention __tests__/unit/http/build-app.spec.ts already
// establishes for this HTTP surface. statusForError()'s own per-class mapping
// is proved separately, in __tests__/unit/errors/status-map.spec.ts; this
// file proves only that the middleware consults it and answers accordingly.
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, expect, it } from 'vitest';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseVersionNotReleasableError } from '../../../errors/case-version-not-releasable.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import { InvestigationWriteDeadlineExceededError } from '../../../errors/investigation-write-deadline-exceeded.error.js';
import { handleUnexpectedError } from '../../../http/error-handler.middleware.js';

/** A minimal Fastify instance wired with the real handleUnexpectedError, and one GET route that always rejects with the given value — the one seam this file's tests drive and observe. */
function buildAppThatRejectsWith(thrown: unknown): FastifyInstance {
  const app = Fastify();
  app.setErrorHandler(handleUnexpectedError);
  app.get('/throw', () => Promise.reject(thrown));
  return app;
}

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

// ------------------------------------------------------------------ criterion 1

it('answers a mapped domain error with the status the status map assigns it, not the generic 500', async () => {
  app = buildAppThatRejectsWith(new CaseNotFoundError('a-slug', 1));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.statusCode).toBe(404);
});

it('answers a second, differently-mapped domain error with its own distinct status too, showing the map is consulted rather than one error special-cased inline', async () => {
  app = buildAppThatRejectsWith(new CaseVersionNotReleasableError('a-slug', 1, ['a violation']));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.statusCode).toBe(422);
});

// ------------------------------------------------------------------ envelope shape (inference)

it("answers a mapped domain error with its own class name as the code and its own context as details", async () => {
  app = buildAppThatRejectsWith(new CaseNotFoundError('a-slug', 1));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.json()).toEqual({
    error: {
      code: 'CaseNotFoundError',
      message: 'no version 1 of the case "a-slug" is stored',
      details: { slug: 'a-slug', version: 1 },
    },
  });
});

// ------------------------------------------------------------------ task/run-diagnosis-persistence-deadline-hotfix/persistence-deadline-uses-remaining-time-and-retries,
// criterion 9: "Every path that raises InvestigationWriteDeadlineExceededError is answered to the
// requester as an HTTP 500 response naming InvestigationWriteDeadlineExceededError as the reported
// condition." Before this hotfix the status map named no status for this class at all, so this
// exact request would have fallen to the generic, unnamed 500 envelope the "still answers 500 with
// the unchanged generic envelope..." test below proves for every class the table still does not
// name — this proves the 500 this specific class now answers is the named domainEnvelope branch
// instead.

it('answers InvestigationWriteDeadlineExceededError with a named 500 envelope, naming the error rather than falling back to the generic, unnamed one', async () => {
  app = buildAppThatRejectsWith(new InvestigationWriteDeadlineExceededError('investigation-1', 300));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({
    error: {
      code: 'InvestigationWriteDeadlineExceededError',
      message:
        'the investigation with id "investigation-1" could not be written within the 300ms remaining of the declared deadline, so no assessment is returned without a corresponding record',
      details: { id: 'investigation-1', remainingMs: 300 },
    },
  });
});

// ------------------------------------------------------------------ criterion 3

it('still answers 500 with the unchanged generic envelope for a typed domain error the status map does not name', async () => {
  app = buildAppThatRejectsWith(new IncoherentCaseError('a-slug', ['a violation']));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'an unexpected error occurred' } });
});

it('still answers 500 for a rejection whose reason is not an Error instance at all', async () => {
  app = buildAppThatRejectsWith('a plain string');

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.statusCode).toBe(500);
});

it("never lets an unmapped error's own message or context reach the client", async () => {
  app = buildAppThatRejectsWith(new IncoherentCaseError('a-secret-slug', ['a sensitive violation']));

  const response = await app.inject({ method: 'GET', url: '/throw' });

  expect(response.body).not.toContain('a-secret-slug');
  expect(response.body).not.toContain('a sensitive violation');
});
