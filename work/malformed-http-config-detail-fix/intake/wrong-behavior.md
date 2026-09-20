# Wrong behavior

File: src/investigation/http-declarative-observation-source.adapter.ts (target: backend / src root)

`unavailableFor(error: Error)` returns:

    { result: 'unavailable', result_detail: error.name }

unconditionally, for every error class it is called with. When the error is a
`MalformedHttpConnectorConfigurationError`, this discards the error's own `context.problems` --
the vocabulary its own constructor already computed (the allowed HTTP methods, or the allowed
evidence-result endings a statusMap may map a status to) -- so `result_detail` states only the
error's class name, never the vocabulary the malformed key was held to.

This contradicts `rules/integration/an-http-connector-configuration-declares-its-method-and-
status-vocabulary`, whose own statement requires: "that result detail states beside that error
the vocabulary the malformed key is held to -- where the method is not one of the five, the
methods an HTTP connector configuration may declare, and where the statusMap is not such an
object, the evidence-result endings a statusMap may map a status to."

`unavailableForUnreachableConnector` already shows the intended pattern for a different error: it
builds a `result_detail` of `${error.name}: ${connector}`, enriching the bare class name with the
one further fact its own rule requires. `unavailableFor`'s single generic body serves multiple
error classes uniformly and enriches none of them.

Reproduction: a connector configuration whose `method` is not one of GET/POST/PUT/PATCH/DELETE
(or whose `statusMap` does not map a status to one of the evidence-result endings), read by
`asHttpConnectorCallConfiguration`, throws `MalformedHttpConnectorConfigurationError` with
`context.problems` populated; `resolveHttpConnectorCallConfiguration` catches it and calls
`unavailableFor(error)`. Expected: `result_detail` states the error's name AND the vocabulary
(the allowed methods, or the allowed evidence-result endings) the malformed key was held to.
Actual: `result_detail` states only `"MalformedHttpConnectorConfigurationError"`.

Found as a conformance finding during /review-change of initiative recursive-output-schema-fields,
confirmed still present in current source.
