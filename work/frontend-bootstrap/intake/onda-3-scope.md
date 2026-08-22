# Onda 3 — Version Editor (e a criação de draft adiada da Onda 2)

Escopo cortado a partir do plano aprovado (`.claude/plans/precious-skipping-summit.md`, seção
"Onda 3 — Version Editor"), citado abaixo verbatim, mais a decisão tomada ao fechar a Onda 2 de
adiar a criação de draft para cá.

## Do plano aprovado

- **2.3 Version Editor**: formulário de campo único porque o `PATCH` é full-replace; a máquina de
  estado `clean → dirty → saving → clean | conflict` (seção 4) fica inteira nesta onda, porque é a
  única linha de defesa contra dois curadores editando o mesmo draft (sem lock no backend); o
  banner de conflito da Onda 1 é ligado a dados reais aqui; 404 redireciona para Cases List.

Depende da Onda 1 (banner de conflito, cliente de API) e da Onda 2 (chega aqui pela navegação de
Case Detail). Isolada como sua própria onda porque a própria proposta já a marca como a tela mais
arriscada — misturá-la com Manifest Builder ou Release dobraria a superfície de uma vez.

## Wireframe da seção 2.3 (docs/frontend-triage-console-proposal.md)

```
Cases ▸ intermittent-connection-outage ▸ v2 (draft)
Editing v2 ● Draft                    [ Discard draft ]  [ Release… ]
────────────────────────────────────────────────────────────────────
 Title
 [ Intermittent internet connection outage                        ]
 When to use
 [ When an attendant needs to troubleshoot a customer contract     ]
 [ reporting an intermittent or unstable internet connection.      ]
 Subject type (fixed)      Consolidation register
 [ contract              ] [ formal                             ▾ ]
 Fallback outcome                    Fallback referral
 [ inconclusive-…-exhausted ▾]      [ escalate-to-specialist → … ▾]
────────────────────────────────────────────────────────────────────
 Last saved 2 min ago · manifest holds 2 hypotheses [open →]
                                                [ Save changes ]
```

Formulário de campo único: o `PATCH` do backend é full-replace, a UI nunca envia um campo
isolado, sempre reenvia o objeto inteiro carregado + editado. "Subject type" aparece desabilitado
porque hoje só existe um vocabulário registrado (`contract`) — mostrar um dropdown de uma opção só
seria ruído; um campo fixo com o rótulo "(fixed)" já ensina a regra.

```
GATILHO: form, on blur ou botão "Save"
AÇÃO: PATCH /v1/cases/{slug}/versions/{version}
SUCESSO (200): re-hidrata o form com o read-back, marca "saved at HH:mm"
FALHA 409 CaseVersionNotDraftError: alguém liberou a versão enquanto você editava —
         bloqueia o form, banner "This version was released by someone else.
         Your changes were not saved.", oferece "start a new draft"
FALHA 404 CaseNotFoundError: caso removido — redireciona para Cases List
```

Banner de conflito (evento `ui.stale_conflict_detected`, o mais importante do catálogo — seção 3):

```
┌──────────────────────────────────────────────────────────┐
│ ! This version was released by someone else                │
│   Your changes were not saved. Reload to see the current    │
│   state, or start a new draft.              [ Dismiss ]     │
└──────────────────────────────────────────────────────────┘
```

## Máquinas de estado (seção 4 da proposta)

- **Case Version (domínio, fixo pelo backend)**: `draft → released` (terminal), um só gatilho.
- **Formulário de edição (UI)**: `clean → dirty → saving → clean | conflict`. Precisa de spec
  própria porque o backend não ajuda em nada aqui (sem optimistic concurrency) — a UI é a única
  linha de defesa contra dois curadores editando o mesmo draft.

## Decisão herdada do fechamento da Onda 2 — criação de draft entra aqui

`case-detail-new-draft-action` foi cortada da Onda 2 e removida do plano: `POST /v1/cases` exige
`title`, `when_to_use`, `authored_at`, `subject` e `fallback`, todos obrigatórios (schema real,
`src/src/http/dto/create-draft.dto.ts`) — não um clique isolado como a proposta (seção 2.2) e o
plano original assumiam.

**Decisão tomada**: "New draft" em Case Detail navega para o Version Editor **em branco** (sem
versão existente carregada) em vez de fazer um POST direto; o primeiro "Save" desse formulário
em branco é que de fato chama `POST /v1/cases` com o conteúdo que o curador preencheu. Editar um
draft existente (`PATCH`) e criar um novo (`POST`) compartilham exatamente o mesmo formulário e a
mesma validação de campo — a diferença é só qual verbo HTTP o "Save" dispara, decidida por se uma
versão já existe ou não.

Isso muda o corpo do formulário desta onda: além dos campos já wireframed (title, when_to_use,
subject fixo, consolidation_register, fallback outcome+referral), a task de criação precisa
resolver `authored_at` (client-side, timestamp do momento do save) e obter valores válidos de
`subject` (hoje só `contract` está registrado — confirmar contra `GET /v1/glossary/...` antes de
fixar como hardcoded) e de `fallback.outcome`/`fallback.referral` (via leitura do glossário —
`domain/glossary/outcome`, `domain/glossary/action`, `domain/glossary/recipient` — para popular os
dois dropdowns "Fallback outcome"/"Fallback referral" o wireframe já desenha).

O 409 `CaseAlreadyHasDraftError` que `POST /v1/cases` pode retornar (a corrida esperada que a
Onda 2 documentou mas não implementou) precisa ser tratado aqui: toast + redirect para o draft
existente, exatamente como a Onda 2 original previa.

## Contrato de comportamento completo (junta 2.2's New draft + 2.3's Save/Discard/Release)

```
GATILHO (criação): botão "New draft" em Case Detail, só visível quando nenhuma versão está em draft
AÇÃO: abre Version Editor em branco; primeiro "Save" chama POST /v1/cases com { slug, title,
      when_to_use, authored_at, subject, fallback }
SUCESSO (201): navega para a versão recém-criada, form agora em modo "editar" (PATCH dali em diante)
FALHA 409 CaseAlreadyHasDraftError: toast "A draft already exists for this case", redireciona
      para o draft existente (resolvido lendo GET /v1/cases/:slug/versions)

GATILHO (edição): form, on blur ou botão "Save", sobre uma versão já existente em draft
AÇÃO: PATCH /v1/cases/{slug}/versions/{version}
SUCESSO (200): re-hidrata o form com o read-back, marca "saved at HH:mm"
FALHA 409 CaseVersionNotDraftError: alguém liberou a versão enquanto editava -- bloqueia o form,
      banner de conflito, oferece "start a new draft"
FALHA 404 CaseNotFoundError: caso removido -- redireciona para Cases List
```

## Fora desta onda, deliberadamente

- **Release** (botão "[ Release… ]" visível no wireframe) e **Discard** (botão
  "[ Discard draft ]") ficam para a Onda 5, exatamente como o plano original já isola.
- **Manifest Builder** ("manifest holds 2 hypotheses [open →]", visível no wireframe mas como link
  de navegação, não como conteúdo editável aqui) fica para a Onda 4.
