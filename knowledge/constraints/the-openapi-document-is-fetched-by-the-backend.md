---
statement: The OpenAPI document a connector configuration draft is generated from, or whose operations are read for the Configuration Helper's listing, is fetched by the backend that generates the draft or reads the operations; no frontend module issues that fetch directly.
scope: integration
fitness: A dependency and network-call audit over the frontend module finds no direct request to an OpenAPI document's own URL; the fetch runs only inside the backend operation that generates the draft or the backend operation that reads its operations.
---

## Description

Fetching server-side avoids a browser-side CORS dependency on whatever application publishes the OpenAPI document, and keeps the one place that reads an operator-supplied URL auditable as a single, reviewable path rather than one folded into whichever screen happens to render it.
