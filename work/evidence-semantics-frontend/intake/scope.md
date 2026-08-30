# Escopo — superfície de operador para a semântica pinada na evidência

Invocação, verbatim:

> iniciativa evidence-semantics-frontend, target frontend. Escopo: superfície de operador para a
> semântica pinada na evidência — (1) browser do glossário exibe e edita a descrição do concept,
> surfaçando a recusa 422 de descrição ausente, e marca concepts legados com descrição vazia para
> completar; (2) formulário de capability orienta a declarar type e description por campo do
> output_schema; (3) painel de simulação exibe por item de evidência a semântica snapshotada
> (concept_description e fields), tolerando registros antigos e descrições vazias com degradação
> honesta, nunca falha.

## Contexto

O lado backend desta capacidade foi entregue pela iniciativa `pinned-evidence-semantics` (target
`backend`), cujo escopo excluiu o frontend explicitamente. A especificação já declara os fatos:
`description` obrigatória no concept com recusa 422 `ConceptDescriptionRequiredError`, o snapshot
`fields` + `concept_description` na evidência, a degradação honesta do legado, e a regra de que
descrição declara significado e nunca política.

## Material de origem

`intake/material.md` carrega o trecho de frontend da proposta que motivou a iniciativa, como
fotografia do que foi decidido ao cortar este plano.
