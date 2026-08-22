---
title: Proof for the global QueryClient and single Toaster mount
summary: The QueryClient's shape, its onError toast handler, and the single Toaster mount are proved by query-client.spec.ts and toaster-mount.spec.ts.
implementation: sha256:4e603cac5a23a894a3b0689577f7228808455ed81fa420bd647a224ca67ac02e
run: run/frontend-console-foundation-onda-1-full-suite-2
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:b65918f325b77f594c710dd4a2e790fbd0998b66fc07363b1fd0b01a1ce6d631
tests:
  - file: src/services/query-client.spec.ts
    name: is a QueryClient instance
    proves: A single module-level QueryClient instance is created with retry:1 and no staleTime set on the client itself.
    fails_when: queryClient stops being built through the QueryClient constructor (e.g. replaced with a plain object or a different client type)
  - file: src/services/query-client.spec.ts
    name: retries a failed query exactly once by default
    proves: A single module-level QueryClient instance is created with retry:1 and no staleTime set on the client itself.
    fails_when: the client's default retry option is anything other than 1
  - file: src/services/query-client.spec.ts
    name: leaves staleTime unset on the client itself, deferring it to each query
    proves: A single module-level QueryClient instance is created with retry:1 and no staleTime set on the client itself.
    fails_when: a staleTime value is set on the client's own defaultOptions.queries
  - file: src/services/query-client.spec.ts
    name: toasts the thrown Error's own message
    proves: The QueryClient's QueryCache declares an onError handler that fires a sonner toast.
    fails_when: the onError handler stops calling toast.error, or calls it with anything other than the thrown Error's own message
  - file: src/services/query-client.spec.ts
    name: toasts a fallback string, rather than throwing, when the rejection carries no Error
    proves: The QueryClient's QueryCache declares an onError handler that fires a sonner toast.
    fails_when: the handler throws for a non-Error rejection value, fails to call toast.error, or echoes the raw non-Error value back as the toasted message
  - file: src/shared/components/toaster-mount.spec.ts
    name: renders exactly one sonner Toaster for every routed screen
    proves: Exactly one Toaster component is rendered in the app, mounted inside the AppShell.
    fails_when: a routed screen renders zero, or more than one, element matching sonner's own "region" landmark with an accessible name of "Notifications ..."
not_applicable:
  - edge_case: onError invoked with a null or undefined rejection reason
    why: neither the criterion nor the handler's own instanceof-Error branch treats null/undefined as distinct from any other non-Error value; the existing "just a string" test already exercises the else branch that a null/undefined value would take too, so a second case would repeat the same branch rather than reach new behavior
  - edge_case: two query failures reaching onError at once
    why: nothing in the task's criteria states a guarantee about ordering or coalescing of concurrent failures, and QueryCache invokes the same synchronous handler once per failure regardless of how many are in flight, so a test asserting concurrent behavior would assert a guarantee nobody made
  - edge_case: a Toaster rendered under more than one matched leaf route at once
    why: the Toaster is mounted inside AppShell, the root route's own component, not inside any leaf; a router match always renders exactly one AppShell regardless of which leaf resolved inside its Outlet, so the single routed screen the existing test exercises ("/cases") is representative of every leaf rather than one case among several that needed separate coverage
untested:
  - "The QueryClientProvider wraps the routed app so every screen shares the same QueryClient instance (criterion 4): neither spec file renders main.tsx's provider tree -- toaster-mount.spec.ts renders AppShell/RouterProvider directly, without QueryClientProvider -- so nothing exercises that every route sees one shared queryClient instance."
  - "The installed @tanstack/react-query version matches TUI's pinned ^5.62.0 (criterion 5): this is a package.json manifest fact, verifiable only by reading the file directly; no test in either spec file reads or asserts against the installed version."
  - "The implementation's inference that the onError fallback text is English rather than TUI's Portuguese string: the existing fallback test asserts only that the toasted message is a non-empty string different from the raw rejection value, never the fallback's actual wording, so the language/wording choice itself is unpinned by any assertion."
  - "The implementation's inference that @tanstack/react-query and sonner are declared under package.json's dependencies rather than devDependencies: this is a manifest placement fact no test in either spec file reads or asserts against."
divergences:
  - cites: TYP-02
    file: src/services/query-client.spec.ts
    departure: >-
      Three guarded/deliberate `as` type assertions (a stand-in Query argument the handler under
      test never reads; a deliberate non-Error value driven through a handler typed to Error; a
      narrowing of a mock call's argument tuple to its known single string) are each suppressed with
      a disclosed eslint-disable-next-line comment.
    why: >-
      this project's eslint.config.js configures @typescript-eslint/consistent-type-assertions with
      assertionStyle "never", flagging every `as` regardless of whether a guard or a deliberate,
      known-safe narrowing accompanies it; TYP-02 itself permits a guarded cast, so each of the three
      is suppressed individually with the specific reason it relies on stated inline, per PRH-03 --
      the same established pattern as api-client.ts's own three disclosed casts.
---

## What it is
Six tests: the QueryClient's shape (instance, retry:1, no client-level staleTime), the onError handler toasting both an Error's own message and a safe fallback for a non-Error rejection, and exactly one Toaster landmark rendering inside AppShell.

## Notes
None.
