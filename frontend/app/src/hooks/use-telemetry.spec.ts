import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CaseDraftCreatedPayload,
  CaseDraftDiscardedPayload,
  CaseDraftUpdatedPayload,
  CaseReleasedPayload,
  HypothesisRevisedPayload,
  ManifestHypothesisPlacedPayload,
  ManifestHypothesisRemovedPayload,
  Telemetry,
  UiStaleConflictDetectedPayload,
} from "./use-telemetry";
import { useTelemetry } from "./use-telemetry";

// One payload literal per cataloged event, each checked against its own
// exported type so a case here can never silently drift from the shape
// use-telemetry.ts actually declares.
const caseDraftCreatedPayload = {
  slug: "case-alpha",
  version: 1,
  source_version: 0,
} satisfies CaseDraftCreatedPayload;

const caseDraftUpdatedPayload = {
  slug: "case-alpha",
  version: 2,
} satisfies CaseDraftUpdatedPayload;

const caseDraftDiscardedPayload = {
  slug: "case-alpha",
  version: 1,
} satisfies CaseDraftDiscardedPayload;

const caseReleasedPayload = {
  slug: "case-alpha",
  version: 3,
} satisfies CaseReleasedPayload;

const manifestHypothesisPlacedPayload = {
  slug: "case-alpha",
  version: 2,
  hypothesis_name: "H1",
  position: 0,
  moved: true,
} satisfies ManifestHypothesisPlacedPayload;

const manifestHypothesisRemovedPayload = {
  slug: "case-alpha",
  version: 2,
  hypothesis_name: "H1",
} satisfies ManifestHypothesisRemovedPayload;

const hypothesisRevisedPayload = {
  slug: "case-alpha",
  hypothesis_name: "H1",
  revision: 2,
  is_new_identity: false,
} satisfies HypothesisRevisedPayload;

const uiStaleConflictDetectedPayload = {
  slug: "case-alpha",
  version: 2,
  action: "release",
} satisfies UiStaleConflictDetectedPayload;

type EventCase = {
  key: keyof Telemetry;
  eventName: string;
  payload: Record<string, unknown>;
  call: (telemetry: Telemetry) => void;
};

// The eight-event catalog, one entry per callable Telemetry exposes. Each
// `call` invokes exactly one of the eight through the typed interface, never
// through a cast, so a case here that no longer matches the interface fails
// to compile rather than passing silently at runtime.
const EVENT_CASES: EventCase[] = [
  {
    key: "caseDraftCreated",
    eventName: "case_draft.created",
    payload: caseDraftCreatedPayload,
    call: (telemetry) => telemetry.caseDraftCreated(caseDraftCreatedPayload),
  },
  {
    key: "caseDraftUpdated",
    eventName: "case_draft.updated",
    payload: caseDraftUpdatedPayload,
    call: (telemetry) => telemetry.caseDraftUpdated(caseDraftUpdatedPayload),
  },
  {
    key: "caseDraftDiscarded",
    eventName: "case_draft.discarded",
    payload: caseDraftDiscardedPayload,
    call: (telemetry) => telemetry.caseDraftDiscarded(caseDraftDiscardedPayload),
  },
  {
    key: "caseReleased",
    eventName: "case.released",
    payload: caseReleasedPayload,
    call: (telemetry) => telemetry.caseReleased(caseReleasedPayload),
  },
  {
    key: "manifestHypothesisPlaced",
    eventName: "manifest.hypothesis_placed",
    payload: manifestHypothesisPlacedPayload,
    call: (telemetry) => telemetry.manifestHypothesisPlaced(manifestHypothesisPlacedPayload),
  },
  {
    key: "manifestHypothesisRemoved",
    eventName: "manifest.hypothesis_removed",
    payload: manifestHypothesisRemovedPayload,
    call: (telemetry) => telemetry.manifestHypothesisRemoved(manifestHypothesisRemovedPayload),
  },
  {
    key: "hypothesisRevised",
    eventName: "hypothesis.revised",
    payload: hypothesisRevisedPayload,
    call: (telemetry) => telemetry.hypothesisRevised(hypothesisRevisedPayload),
  },
  {
    key: "uiStaleConflictDetected",
    eventName: "ui.stale_conflict_detected",
    payload: uiStaleConflictDetectedPayload,
    call: (telemetry) => telemetry.uiStaleConflictDetected(uiStaleConflictDetectedPayload),
  },
];

describe("useTelemetry", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
  });

  it("exposes exactly the eight cataloged events, each as its own callable", () => {
    const telemetry = useTelemetry();
    const exposedKeys = Object.keys(telemetry).sort();
    const cataloguedKeys = EVENT_CASES.map((eventCase) => eventCase.key).sort();
    expect(exposedKeys).toEqual(cataloguedKeys);
    for (const key of cataloguedKeys) {
      expect(typeof telemetry[key]).toBe("function");
    }
  });

  it.each(EVENT_CASES)(
    "calling $key emits a console.info call namespaced telemetry:$eventName carrying its payload",
    ({ call, eventName, payload }) => {
      const telemetry = useTelemetry();
      call(telemetry);
      expect(infoSpy).toHaveBeenCalledWith(`telemetry:${eventName}`, payload);
    },
  );

  it.each(EVENT_CASES)(
    "calling $key triggers console.info exactly once, so none of the other seven fires alongside it",
    ({ call }) => {
      const telemetry = useTelemetry();
      call(telemetry);
      expect(infoSpy).toHaveBeenCalledTimes(1);
    },
  );

  it("passes a payload lacking the optional source_version through unchanged", () => {
    const telemetry = useTelemetry();
    const payloadWithoutSourceVersion = { slug: "case-beta", version: 1 };
    telemetry.caseDraftCreated(payloadWithoutSourceVersion);
    expect(infoSpy).toHaveBeenCalledWith(
      "telemetry:case_draft.created",
      payloadWithoutSourceVersion,
    );
  });

  it("never invokes fetch for any of the eight cataloged events", () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => Promise.reject(new Error("no network call is expected")));
    const telemetry = useTelemetry();
    for (const eventCase of EVENT_CASES) {
      eventCase.call(telemetry);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
