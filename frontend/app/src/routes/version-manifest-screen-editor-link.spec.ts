import { afterEach, describe, expect, it, vi } from "vitest";
// Walking the manifest screen through five distinct readings inside one test body; automatic
// cleanup only runs between separate it()s, not between renders inside one, so each mount past
// the first unmounts the prior render itself before mounting again.
// eslint-disable-next-line testing-library/no-manual-cleanup -- reason above (PRH-03).
import { cleanup, screen } from "@testing-library/react";
import {
  apiErrorResponse,
  createFetchStub,
  entry,
  jsonResponse,
  mountManifestScreen,
  SLUG,
  VERSION,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

const EDITOR_HREF = `/cases/${SLUG}/versions/${VERSION}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(
  "VersionManifestScreen — a route to the named version's own editing surface stands on " +
    "every reading of the manifest screen, keyed to the version in its own path (criteria 1-6; " +
    "rules/knowledge/a-presented-case-version-offers-a-route-to-its-own-editing-surface-on-every-reading)",
  () => {
    it(
      "renders an Edit version link to /cases/$slug/versions/$version, carrying the manifest " +
        "screen's own path version, while the read is still pending, once it has failed to " +
        "complete, once it has been refused with CaseVersionNotValidError, once it has " +
        "answered a draft version and once it has answered a released version",
      async () => {
        const pendingFetch = vi.fn(() => new Promise<Response>(() => {}));
        await mountManifestScreen(pendingFetch);
        expect(
          screen.getByRole("link", { name: "Edit version" }).getAttribute("href"),
          "expected the route present before the read has answered",
        ).toBe(EDITOR_HREF);

        cleanup();
        vi.unstubAllGlobals();

        const failedFetch = createFetchStub({
          [`GET ${VERSION_PATH}`]: () => {
            throw new Error("network down");
          },
        });
        await mountManifestScreen(failedFetch);
        await screen.findByText("Unable to load this manifest right now.");
        expect(
          screen.getByRole("link", { name: "Edit version" }).getAttribute("href"),
          "expected the route present once the read failed to complete",
        ).toBe(EDITOR_HREF);

        cleanup();
        vi.unstubAllGlobals();

        const notValidFetch = createFetchStub({
          [`GET ${VERSION_PATH}`]: () =>
            apiErrorResponse("CaseVersionNotValidError", 409, "validation failed"),
        });
        await mountManifestScreen(notValidFetch);
        await screen.findByText(`Version ${VERSION} of this case does not read back as a case.`);
        expect(
          screen.getByRole("link", { name: "Edit version" }).getAttribute("href"),
          "expected the route present once the read was refused with CaseVersionNotValidError",
        ).toBe(EDITOR_HREF);

        cleanup();
        vi.unstubAllGlobals();

        const draftFetch = createFetchStub({
          [`GET ${VERSION_PATH}`]: () =>
            jsonResponse({ state: "draft", manifest: [entry(1, "H1", 2)] }),
        });
        await mountManifestScreen(draftFetch);
        await screen.findByLabelText("H1");
        expect(
          screen.getByRole("link", { name: "Edit version" }).getAttribute("href"),
          "expected the route present once the read answered a draft version",
        ).toBe(EDITOR_HREF);

        cleanup();
        vi.unstubAllGlobals();

        const releasedFetch = createFetchStub({
          [`GET ${VERSION_PATH}`]: () =>
            jsonResponse({ state: "released", manifest: [entry(1, "H1", 2)] }),
        });
        await mountManifestScreen(releasedFetch);
        await screen.findByLabelText("H1");
        expect(
          screen.getByRole("link", { name: "Edit version" }).getAttribute("href"),
          "expected the route present once the read answered a released version",
        ).toBe(EDITOR_HREF);
      },
    );
  },
);
