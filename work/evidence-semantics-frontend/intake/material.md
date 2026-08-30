# Material — trecho de frontend da proposta "semântica pinada na evidência"

Copiado de `temp/desenv/greenfield-judgment-semantics-proposal.md` (seção 5, tabela Frontend, e
as passagens de G1/G2/G3 que a fundamentam), como fotografia no momento do corte deste plano.

## Seção 5 — Frontend (`frontend/app/`)

| onde | o quê |
|---|---|
| browser do glossário | exibir/editar descrição de concept; marcar legados sem descrição |
| formulário de capability | dica sobre `description` por campo no output_schema |
| detail panel da simulação / leitura de investigação | exibir a semântica snapshotada junto da evidência (opcional, recomendado) |

## G1 — O concept ganha significado (glossário)

- Escritas novas: registro de concept sem descrição é recusado (422, erro tipado).
- Concepts já registrados: lidos como descrição vazia; a UI do glossário os marca para o operador
  completar. Sem backfill automático (escrita é do operador).

## G2 — Semântica por campo no `output_schema`

O `output_schema` declara, por campo, além do nome: `type` e `description`, quando declarados.
Nenhum outro campo do JSON Schema é validado ou lido; são dica de operador.

Exemplo:

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "description": "situação do contrato no ERP: 1=ativo, 2=suspenso por inadimplência, 3=cancelado"
    },
    "dias_em_atraso": { "type": "integer", "description": "dias corridos desde o vencimento mais antigo em aberto" }
  }
}
```

## G3 — Snapshot de semântica na evidência

A evidência carrega `fields` ({ name, type?, description? }, many) e `concept_description`,
como estavam no instante da coleta. Concept legado snapshota descrição vazia; capability que não
resolveu snapshota fields vazio — degradação honesta, dita no registro, nunca inventada.

## Custos aceitos (fardo de autoria)

Operadores passam a escrever descrições (concept e campos). É o preço de uma língua com
dicionário; painel e julgamento devolvem o valor.
