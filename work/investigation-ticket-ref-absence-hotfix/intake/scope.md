Correção corretiva. Comportamento errado: em relational-investigation-store.repository.ts,
investigationOf (linha 403) lê `ticket_ref: row.ticket_ref ?? ''` — converte ausência em string
vazia, ao contrário de result_detail (linha 290) e determining_hypothesis (linha 427) no mesmo
arquivo, que preservam ausência via spread condicional.

domain/investigation/investigation já declara ticket_ref como opcional: "requester is always
given, ticket_ref is not — not every diagnose call carries a ticket". Evidência completa em
siegard-reconcile/backend-investigation-glossary-connector-cluster-code-drift.md (nó
domain/investigation/investigation).