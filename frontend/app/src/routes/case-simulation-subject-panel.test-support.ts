import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseSimulationSubjectPanel } from "./case-simulation-subject-panel";
import type { SimulationRequiredField, SimulationSubjectState } from "../hooks/use-simulation-subject";
import type { SimulationSubjectFieldCapability } from "../services/simulation-subject-derivation";

// Shared fixtures and render helper for the Subject panel's proof, split across
// case-simulation-subject-panel.spec.ts (the subject type, the requester, and the
// requirement-rendering block: required standing and every asking capability's own
// name/version/connector plus its own input-schema hint --
// task/subject-input-requirements/present-each-requirement-with-its-required-standing),
// case-simulation-subject-panel-attributes.spec.ts (the add-attribute control) and
// case-simulation-subject-panel-json-view.spec.ts (the view-subject-JSON control, the
// explicit empty-requirements state, and the loading/error states) -- mirroring
// use-simulate-case.test-support.ts's own established one-support-file-per-unit pattern.
//
// buildRequiredField/buildCapability build the current SimulationRequiredField shape (an
// attribute, its required flag, and an array of every currently-resolved asking
// capability -- each its own name/version/connector plus a free-text input-schema hint),
// which superseded the retired singular connector/capability/inputSchemaHint shape
// (task/subject-input-requirements/derive-subject-fields-from-input-requirements).
//
// Every fixture subject built below carries at least one attribute-value: a prior task's
// own Notes carry an UNDERDETERMINED entry over rules/investigation/a-subject-carries-at-
// least-one-attribute, which forbids an empty subject even though nothing in this task's
// own criteria enforces it here -- so no test built on these fixtures renders or asserts a
// zero-attribute subject as an accepted state, that rule being enforced elsewhere
// (use-simulation-subject-hook's own readiness gate).
//
// Two live network reads (useGlossaryVocabularyOptions for "subject-type" and
// "subject-attribute") back the Type field and the add-attribute row's own Attribute field, so
// every mount here goes through a stubbed global fetch inside a QueryClientProvider, mirroring
// glossary-browser-screen.test-support.ts's own mountGlossaryBrowserScreen and
// connector-test-panel.test-support.ts's own selectOptionAsync conventions.

export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const SUBJECT_ATTRIBUTE_PATH = "/v1/glossary/subject-attribute";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function glossaryPage(names: readonly string[]): unknown {
  return { data: names.map((name) => ({ name })), total: names.length, limit: 20, offset: 0, pageCount: 1 };
}

function createFetchStub(handlers: Partial<Record<string, () => Response | Promise<Response>>>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(`case-simulation-subject-panel proof: no mocked response registered for ${url}`);
    }
    return handler();
  });
}

/** Awaits both glossary reads settling (their own loading text disappearing) -- a no-op for a text already gone. */
async function awaitGlossariesSettled(): Promise<void> {
  const loadingSubjectTypes = screen.queryByText("Loading subject types…");
  if (loadingSubjectTypes !== null) {
    await waitForElementToBeRemoved(loadingSubjectTypes);
  }
  const loadingSubjectAttributes = screen.queryByText("Loading subject attributes…");
  if (loadingSubjectAttributes !== null) {
    await waitForElementToBeRemoved(loadingSubjectAttributes);
  }
}

export async function renderPanel(
  state: SimulationSubjectState,
  options: {
    readonly handlers?: Partial<Record<string, () => Response | Promise<Response>>>;
    readonly awaitSettled?: boolean;
  } = {},
): Promise<{ fetchMock: Mock<FetchFn> }> {
  const { handlers = {}, awaitSettled = true } = options;
  const fetchMock = createFetchStub({
    [SUBJECT_TYPE_PATH]: () => jsonResponse(glossaryPage(["billing-dispute", "customer-account"])),
    [SUBJECT_ATTRIBUTE_PATH]: () => jsonResponse(glossaryPage(["account-id", "email"])),
    ...handlers,
  });
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(QueryClientProvider, { client: queryClient }, createElement(CaseSimulationSubjectPanel, { state })),
  );
  if (awaitSettled) {
    await awaitGlossariesSettled();
  }
  return { fetchMock };
}

/** One asking capability, as the current DerivedSubjectField/SimulationSubjectFieldCapability shape carries it: its own name, version and connector, plus its own free-text input-schema hint (empty where none). */
export function buildCapability(
  overrides: Partial<SimulationSubjectFieldCapability> = {},
): SimulationSubjectFieldCapability {
  return {
    name: "check-balance",
    version: "1.0.0",
    connector: "core-banking-connector",
    inputSchemaHint: "",
    ...overrides,
  };
}

export function buildRequiredField(overrides: Partial<SimulationRequiredField> = {}): SimulationRequiredField {
  return {
    attribute: "account-id",
    required: true,
    capabilities: [buildCapability()],
    value: "12345",
    onChange: vi.fn(),
    ...overrides,
  };
}

export function baseState(overrides: Partial<SimulationSubjectState> = {}): SimulationSubjectState {
  return {
    requiredFields: [buildRequiredField()],
    requester: "",
    onRequesterChange: vi.fn(),
    addedAttributes: [],
    onAddAttribute: vi.fn(),
    onRemoveAttribute: vi.fn(),
    onAttributeChange: vi.fn(),
    subject: { type: "billing-dispute", attributes: [{ attribute: "account-id", value: "12345" }] },
    isReady: true,
    isLoadingRegistries: false,
    isRegistriesError: false,
    ...overrides,
  };
}
