# Onda 5 — Release e Discard (ações terminais)

Escopo cortado a partir do plano aprovado (`.claude/plans/precious-skipping-summit.md`, seção
"Onda 5 — Release e Discard (ações terminais)"), citado abaixo verbatim, mais as seções 2.6/2.7 do
`docs/frontend-triage-console-proposal.md` (citadas na íntegra), mais os fatos reais do backend
confirmados agora (não assumidos do wireframe).

## Do plano aprovado

- **2.6 Release**: modal de confirmação, checklist de validação agregada (sucesso e a variante
  multi-violação do `422 CaseVersionNotReleasableError` lado a lado).
- **2.7 Discard**: modal destrutivo, confirmação por digitação do slug, texto explícito de que as
  hypothesis-revisions sobrevivem.

Depende da Onda 3 (Version Editor é onde os dois botões vivem — "[ Release… ]" e
"[ Discard draft ]", já desenhados no wireframe do Version Editor mas nunca implementados).
Separada da Onda 3 porque são ações terminais e de menor superfície de estado — misturar
arriscaria a máquina de estado do form com dois fluxos de modal que não a tocam.

## Wireframes (docs/frontend-triage-console-proposal.md)

### 2.6 Release — modal de confirmação

```
        ┌ Release v2? ──────────────────────────────────┐
        │ Once released, this version and every manifest │
        │ entry it holds are frozen — permanently.        │
        │                                                  │
        │ ✓ Manifest holds at least one hypothesis (2)     │
        │ ✓ Fallback resolution is set                     │
        │ ✓ Every collected concept accepts the case        │
        │   subject                                         │
        │                                                    │
        │                    [ Cancel ]      [ Release ]     │
        └────────────────────────────────────────────────────┘
```

Variante quando o `422 CaseVersionNotReleasableError` agrega múltiplas violações — a UI **precisa**
mostrar todas juntas, porque o backend já as agrega; mostrar uma de cada vez forçaria o curador a
tentar de novo repetidamente para descobrir a próxima:

```
        │ ✓ Manifest holds at least one hypothesis (2)      │
        │ ! Fallback resolution is set                       │
        │ ! area-network-outage: network-outage-flag no      │
        │   longer accepts "contract"                        │
```

```
GATILHO: botão "Release…" no Version Editor
AÇÃO: POST .../release
SUCESSO (200): estado muda para "released", form vira somente-leitura
FALHA 422 CaseVersionNotReleasableError: lista TODAS as violações juntas (acima)
FALHA 409 CaseVersionNotDraftAtReleaseError: já foi liberado por outra sessão — recarrega
```

### 2.7 Discard — modal destrutivo

```
        ┌ Discard this draft? ──────────────────────────┐
        │ customer-equipment-fault and area-network-      │
        │ outage keep their content — only this draft      │
        │ and its manifest are removed. This cannot be      │
        │ undone.                                            │
        │                                                     │
        │ Type the case slug to confirm                       │
        │ [ intermittent-connection-outage                 ]  │
        │                                                      │
        │           [ Keep draft ]      [ Discard draft ]      │
        └──────────────────────────────────────────────────────┘
```

Confirmação por digitação do slug, não só um checkbox: é a única ação irreversível que apaga (as
outras — release — só congelam). O texto explica explicitamente que as hypothesis-revisions
sobrevivem, porque é contra-intuitivo e vale ensinar na primeira vez.

```
GATILHO: botão "Discard draft" no Version Editor
AÇÃO: DELETE /v1/cases/{slug}/versions/{version}
SUCESSO (204): navega para Case Detail
FALHA: qualquer erro mantém o modal aberto com a mensagem
```

## Achado real do backend (confirmado agora, substitui o que o wireframe assumia)

Verificado lendo o código real, não a proposta:

1. **`POST /v1/cases/{slug}/versions/{version}/release` não recebe corpo.** Responde `200` com a
   projeção completa de `read-case` (o mesmo shape de `GET /v1/cases/:slug/versions/:version`).
   Erros reais: 404 `CaseNotFoundError`; 409 `CaseVersionNotDraftAtReleaseError` (contexto
   `{slug, version, state}`, checado ANTES de qualquer validação); 422
   `CaseVersionNotReleasableError` (contexto `{slug, version, violations: string[]}`).

2. **A agregação de violações é real, mas em duas metades mutuamente exclusivas — nunca as duas
   juntas.** `release.operation.ts` roda validação estrutural primeiro (`parse-case-document.ts`:
   campos obrigatórios presentes, `consolidation_register`/`state` fechados ao enum,
   manifest não-vazio — "o case declara nenhuma hipótese" é exatamente o item "Manifest holds at
   least one hypothesis" do wireframe —, cada entrada do manifest com posição/hipótese/revisão
   íntegras, `fallback` completo (outcome + referral{action, recipient}) como campo obrigatório).
   **Só se a estrutura for válida** roda a validação de coerência (`validate-case-coherence.ts`):
   todo termo nomeado (subject, outcome/action/recipient de cada resolution) existe no glossário;
   todo concept coletado existe no glossário E aceita o subject do case (exatamente "every
   collected concept accepts the case subject" do wireframe); todo concept tem uma capability
   read-only registrada com schema e timeout. Cada metade agrega TODAS as suas próprias violações
   numa lista só — mas a metade estrutural e a de coerência nunca aparecem juntas na mesma resposta,
   porque a coerência só roda depois que a estrutura já passou.

   **Isso corrige o exemplo do wireframe**: o exemplo de "múltiplas violações" mostra "Fallback
   resolution is set" (que soa estrutural — fallback ausente) ao lado de um erro de concept (que é
   coerência) — essa combinação exata não pode ocorrer no backend real. O que PODE ocorrer, e
   produz o mesmo efeito visual pretendido pelo wireframe, é um termo do fallback (outcome/action/
   recipient) que existia no glossário e foi removido depois — isso É uma violação de coerência
   (`vocabularyViolations`), que aparece na mesma lista que uma violação de concept. A tela
   continua precisando mostrar todas as violações que a resposta real trouxer, juntas, exatamente
   como o wireframe pede — só o rótulo exato de cada item precisa vir do texto real que o backend
   devolveu em `violations`, nunca de um checklist fixo com três frases fixas.

3. **Não existe endpoint de pré-validação (dry-run).** O checklist mostrado ANTES de clicar
   "Release" só pode ser honestamente computado no cliente para o que já está carregado ou é barato
   de buscar de novo:
   - "Manifest holds at least one hypothesis (N)" — direto de `GET .../versions/{version}`'s own
     `manifest.length`.
   - "Fallback resolution is set" — `fallback` é campo obrigatório na resposta de leitura, então
     está sempre presente estruturalmente; o que pode realmente falhar é um dos SEUS termos
     (outcome/action/recipient) ter saído do glossário — só descoberto lendo o glossário de novo
     (mesma leitura que a Onda 4 já faz para outcome/action/recipient).
   - "Every collected concept accepts the case subject" — derivável no cliente lendo
     `GET /v1/glossary/concepts` de novo (mesma leitura que `use-concept-options.ts`, Onda 4, já
     faz) e cruzando `collects` de cada hypothesis-revision do manifest contra o `accepts` de cada
     concept e o `subject` do case.
   - A verificação de **capability** (todo concept respondido por uma capability read-only
     registrada, com schema e timeout) **não é derivável no cliente hoje**: exigiria ler
     `GET /v1/capabilities`, um domínio (`domain/integration/capability`) que nenhuma task deste
     frontend tocou ainda — é exatamente o território da Onda 6 (Capabilities Browser), ainda não
     entregue.

   **Decisão necessária aqui**: o checklist pré-Release mostra os três itens do wireframe
   (manifest, fallback, concept-aceita-subject) computados no cliente como melhor esforço — nunca
   uma promessa, já que tanto o vocabulário quanto os concepts podem mudar entre o cálculo e o
   clique real. **A verificação de capability fica de fora do checklist pré-clique**: não é
   fingida como sempre-verde, e uma falha real nela só aparece depois do clique, na resposta real
   de `POST .../release`, misturada às outras violações de coerência que a resposta trouxer.

4. **`DELETE /v1/cases/{slug}/versions/{version}` (discard) não recebe corpo.** A confirmação por
   digitação do slug do wireframe é inteiramente uma barreira client-side — o servidor não valida
   nem espera nenhum eco do slug no corpo. Responde `204` sem corpo. Erros reais: 404
   `CaseNotFoundError`; 409 `CaseVersionNotDraftError` (reaproveitado — não existe uma classe de
   erro própria para "não é draft" no discard, ao contrário do release que tem
   `CaseVersionNotDraftAtReleaseError` só para si).

5. **Discard confirmado: nunca apaga hypothesis-revisions.** Remove só a case-version e suas
   próprias entradas de manifest; a hipótese e todas as suas revisões continuam existindo,
   referenciadas por nada — exatamente o texto do wireframe ("customer-equipment-fault and
   area-network-outage keep their content").

## Fora desta onda, deliberadamente

- **Try it (sandbox de diagnose)** — fora de todo o plano, decidido quando a proposta original foi
  revisada.
- **A verificação de capability no checklist pré-Release** — fica de fora pelo motivo do item 3
  acima; o território de capability é da Onda 6.
- **Onda 6 (Glossary + Capabilities Browsers)** — paralela, independente desta onda.
