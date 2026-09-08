---
statement: Every screen the frontend presents discloses to the user that this build enforces no authentication; no screen is presented without that disclosure.
scope: system
fitness: Rendering the frontend at any route it can present yields the disclosure that this build enforces no authentication, and its presence turns on nothing further — not on which route is current, not on what any read backing the screen answered, and not on who the user is.
---

## Description

The disclosure is the substance, not a fixed wording: what the frontend owes every user is being told, on every screen, that this build enforces no authentication — the exact copy is the frontend's own to choose and free to change without this statement moving.
This constrains the solution and not the domain: what gets disclosed is `no-route-enforces-authentication`'s own posture — the current state of the solution's perimeter — so this statement stands exactly as long as that one does, and goes with it when a later build decides otherwise. That is also why it is not a rule of the business: a rule outlives a build and binds a Domain Model element, and this binds none — it is owed on every screen, over no subject the domain names.
How the frontend achieves it — which component renders it, where on a screen it sits, what it says — is the frontend's own arrangement, and this states none of it.
