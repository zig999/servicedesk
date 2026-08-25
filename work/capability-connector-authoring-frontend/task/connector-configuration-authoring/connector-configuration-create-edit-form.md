---
title: Connector configuration create and edit screen
summary: A new screen listing every registered connector configuration, with create and edit by name for its JSON configuration.
rationale: No connector-configuration screen exists today; this task is cut as one unit — list, create and edit together — because it is a single new area of the app rather than an addition to something already delivered, matching how the capability and concept editors extend their existing screens as one change each.
sources:
  - work/capability-connector-authoring-frontend/intake/scope.md
objective: An operator can create a new connector configuration and edit an existing one, by name, with its configuration authored as JSON, from a new screen.
criteria:
  - A new route reachable from the app's navigation lists every currently registered connector configuration by name.
  - The screen offers a "New connector configuration" action that opens a form for name and configuration.
  - Each connector configuration in the list offers an edit action that opens the same form pre-filled with its current name and configuration.
  - The configuration field is edited through the shared JSON beautify/minify textarea, and the value persisted on save is the minified JSON.
  - A successful create or edit replaces whatever configuration previously answered to that name, and the screen reflects the current configuration afterward.
depends_on:
  - task/capability-authoring/json-textarea-editor
implements:
  - domain/integration/connector-configuration
  - domain/integration/connector-configuration-registry
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - contracts/integration/connector-configuration-registry
---

## What it is

A new screen: list every registered connector configuration by name, create one, and edit one — its `configuration` field authored as JSON through the shared beautify/minify textarea.

## Notes

None.
