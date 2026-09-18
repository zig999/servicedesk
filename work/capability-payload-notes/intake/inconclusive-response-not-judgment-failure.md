# Scope — corrective increment

Wrong behavior: outcomeFromModelText in anthropic-hypothesis-evaluator.adapter.ts records a
well-formed model response of exactly {"verdict":"inconclusive"} — the response the system
prompt itself instructs the model to give whenever the evidence does not ground either verdict —
under the same reason "judgment-failure" used when the response could not be parsed at all
(malformed JSON, an unrecognized shape). rules/investigation/an-inconclusive-evaluation-declares-its-reason
states a closed vocabulary of reasons and a well-formed inconclusive answer is not the same event
as an infrastructure/parsing failure, but both are recorded identically today.

Reproduction: have the model return the well-formed JSON `{"verdict":"inconclusive"}`; the
adapter answers with reason "judgment-failure", indistinguishable from a response that could not
be parsed at all.

File: src/investigation/anthropic-hypothesis-evaluator.adapter.ts
