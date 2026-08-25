---
type: value-object
attributes:
  - name: connector
    type: string
    required: true
  - name: configuration
    type: string
    required: true
---

## Description

A named, opaque configuration an operator authors directly, naming everything one connector needs to derive and issue its call.
Its shape is not fixed here, the same restraint a capability's own input and output schemas already hold: what it must be is a well-formed JSON object; what its keys mean is the executing connector's own statement, made for the HTTP connector by an-http-connector-configuration-declares-its-call and applied at observation rather than at registration.
Its configuration is held and answered as JSON object text, whatever form a registration supplied it in.
A capability's own connector attribute may name one of these by its connector value, but nothing enforces that the name resolves to a configuration that exists — exactly as a capability may be registered today before its connector is ever configured.

## Responsibility

Hold, by name, whatever configuration a connector currently answers to, replacing it whole on every edit rather than merging into what stood before; carry a connector name, since without one there is nothing to hold it by.
