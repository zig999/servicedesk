# Hipótese fora do manifest — `cadeia-orfa-survey-anexo`

Esta hipótese **existe, está escrita, e não está no `1.json`**. Não é esquecimento: contra o IFS
como ele está hoje, incluí-la produziria **falso-positivo por construção**. Este documento guarda o
texto pronto, a razão do bloqueio e o que precisa mudar.

## O que ela diria

| campo | valor |
|---|---|
| `hypothesis_name` | `cadeia-orfa-survey-anexo` |
| `position` | 4 (última — a mais caro de descartar) |
| `revision` | 1 |
| `criterion` | As respostas de formulário da tarefa apresentam ponteiro de anexo sem o item correspondente na biblioteca de mídia do servidor. |
| `collects` | `eform-respostas-e-fotos` (V7 → `get-task-survey-media`) |
| `resolution.outcome` | `issue-cadeia-orfa-survey-anexo` |
| `resolution.referral` | `escalar-fornecedor-ifs` → `fila-fornecedor-ifs` |
| procedência | regra **F5** (`cadeiaOrfaSurveyAnexo`), pendência **P-2**, disciplina **P-3** |

A disciplina **P-3** é o que a resolução carrega: reprocessar o **pai** primeiro — "Try Resend" no
anexo solto não resolve.

Termos de glossário que ela contribuiria: `outcome` `issue-cadeia-orfa-survey-anexo` e `concept`
`eform-respostas-e-fotos`. Nenhum dos dois está registrado — ver `../_glossary/vocabulary.md`
§"Termos adiados".

## Ela também não funcionava no material de origem — por outro motivo

Isto é procedência importante, e muda como o bloqueio deve ser lido: **a hipótese nunca confirmou
em produção**, nem antes. O `1.collects.md` de origem registra a razão sob "Ressalva de
implementação (Rule 12 — fail loud)":

> *"na versão atual do `mwo-catalog` (`v7-task-survey-media.ts`, comentário `spec_divergence`), a
> projeção emite `survey.mediaPointers` **sempre como `[]`** — o DTO da operação
> `get-task-survey-media` não expõe o `KEY_REF` da resposta (é metadata-only por BR-06). Com
> `pointerKeys.size === 0`, F5 devolve **sempre `notDetected`** hoje, mesmo que exista cadeia órfã
> real no banco."*

Havia pendência aberta para isso — **P-2**, em `kb/pendencias.md` — e a case-spec já classificava
F5 como "achado forense secundário".

**Mas os dois modos de falha são opostos, e o novo é o perigoso.** No material de origem a
hipótese ficava sempre `notDetected`: falso-negativo, inútil mas seguro. Contra o IFS, o juiz veria
`hasPicturePointer: true` com `media: {}` e **confirmaria** — falso-positivo. O bloqueio não é a
continuação da pendência antiga; é ela virando do avesso.

## Por que está bloqueada

A operação do IFS existe — `get-task-survey-media`
(`ifs/knowledge/contracts/fsm/task-queries.md`, `GET /v1/tasks/:taskId/survey-media`) — e o modelo
de domínio declara o pareamento com a mídia: `domain/fsm/media-match`, com
`rules/fsm/media-match-is-exact` dizendo que o pareamento é por chave exata, "nunca parcial", para
que a mídia da resposta 76 não colida com a da 760.

Mas a leitura **não faz o pareamento**. Em
`ifs/backend/src/store-access/fsm/read-survey-media-records.ts`:

```ts
const NO_MEDIA_MATCH: MediaMatch = {};                                       // l. 23
```
```
/* This query selects no column from `IFSAPP.MEDIA_LIBRARY_ITEM` and joins    // l. 37-39
 * nothing to it: see buildMediaMatch's own doc comment for why, disclosed in
 * full in this task's delivery record as this task's own inference. */
```

E a query confirma — só `IFSAPP.JT_TASK_SURVEY_ANSWERS`, sem nenhuma coluna de mídia:

```sql
select to_char(sa.answer_id) as "id", to_char(sa.question_id) as "questionId",
       to_char(sa.answer_set) as "answerSet",
       case when sa.upload_picture_data is not null and length(sa.upload_picture_data) > 0
         then 'Y' else 'N' end as "hasPicturePointer"
  from ifsapp.jt_task_survey_answers sa
 where sa.task_seq = :taskId
 fetch first :rowCap rows only
```

Logo, **toda** resposta vem `media: {}` — `mediaKeyRef` e `itemId` sempre ausentes.

## Por que isso é pior do que "sem dado"

Se fosse simplesmente ausência de dado, a hipótese nunca confirmaria e o custo seria uma
hipótese inútil. O problema é o contrário:

O juiz recebe a observação inteira serializada
(`http-declarative-observation-source.adapter.ts:234`), leria
`{"hasPicturePointer": true, "media": {}}` e um critério que diz "ponteiro de anexo **sem** o item
correspondente na biblioteca" — e **confirmaria**. Corretamente, dado o que vê. Só que o `media`
vazio é artefato de uma leitura que não fez o join, **não um fato sobre o store**: nenhum anexo
está órfão; o IFS simplesmente não olhou.

O resultado seria uma escalação ao fornecedor, em cima de uma perda de dados que não aconteceu,
toda vez que a tarefa tiver qualquer foto. E seria uma conclusão *com citação válida* — o campo
citado existe, o valor citado está lá. A checagem mecânica de citação do motor não pega isto,
porque não é uma citação inventada: é um dado correto sobre uma leitura incompleta.

Por isso a hipótese fica fora, e não fica como "hipótese que provavelmente não confirma".

## O que precisa mudar para desbloquear

Do lado do **IFS**, e só de lá — nada em `docs/cases/` resolve isto:

1. `read-survey-media-records.ts` passar a ler `IFSAPP.MEDIA_LIBRARY_ITEM` (e o objeto de
   biblioteca que o pareia) e a preencher `MediaMatch.mediaKeyRef` / `MediaMatch.itemId`, de modo
   que uma resposta com ponteiro e sem item seja **distinguível** de uma resposta que ninguém
   pareou. Hoje as duas são o mesmo `{}`.

   O material de origem carrega o join exato, verificado contra o schema real — vale como ponto de
   partida, e explica de onde vem `rules/fsm/media-match-is-exact`:

   ```sql
   SELECT a.answer_id, a.answer_set, a.question_id,
          CASE WHEN a.upload_picture_data IS NOT NULL
                AND DBMS_LOB.GETLENGTH(a.upload_picture_data) > 0
               THEN 1 ELSE 0 END AS tem_ponteiro,
          m.key_ref  AS media_key_ref,
          i.item_id
     FROM ifsapp.jt_task_survey_answers_tab a
     LEFT JOIN ifsapp.media_library_tab m
            ON m.lu_name = 'JtTaskSurveyAnswers'
           AND m.key_ref = 'ANSWER_ID=' || a.answer_id || '^'
     LEFT JOIN ifsapp.media_library_item_tab i
            ON i.library_id = m.library_id
    WHERE a.task_seq = :task_seq
    ORDER BY a.answer_set, a.answer_id;
   ```

   Duas coisas a notar: o casamento é por `KEY_REF` **exato**
   (`'ANSWER_ID=' || answer_id || '^'`), nunca `LIKE` — é literalmente o que
   `rules/fsm/media-match-is-exact` protege ("a partial match would let answer 76's media collide
   with answer 760's"). E o objeto de biblioteca é discriminado por
   `lu_name = 'JtTaskSurveyAnswers'`, sem o qual o join pega mídia de outras entidades. Os nomes
   aqui são as tabelas `_TAB`; o IFS lê as views correspondentes, então os nomes precisam ser
   conferidos contra o schema antes de virar código lá.
2. Isso é mudança de comportamento sobre um nó que a especificação do IFS já contém
   (`domain/fsm/media-match`, `rules/fsm/media-match-is-exact` — a regra já existe, a leitura é que
   não a cumpre). No vocabulário do Siegard: **um comportamento errado em código já entregue**, que
   entra pelo incremento corretivo do `/plan-work` daquele projeto, não pelo `/analyse`.
3. Feito isso: registrar o `concept` `eform-respostas-e-fotos` e o `outcome`
   `issue-cadeia-orfa-survey-anexo`, escrever a capability e o connector
   (`GET /v1/tasks/${subject:task-seq}/survey-media`, `responseMap: { "answers": "data" }` — `data`
   já é o array), e **acrescentar `task-seq` ao vocabulário `subject-attribute`**, porque este é o
   primeiro collect task-scoped do caso.
4. E então: `reviseHypothesis` + `placeHypothesis` numa **nova versão** do caso. A v1, uma vez
   liberada, é imutável (`0006-case-version-immutability.sql`).

## Nota sobre o sujeito, que **não** é o bloqueio

Vale registrar, porque é contraintuitivo: um caso com `subject: technician` **pode** coletar um
concept que precisa de `task-seq`. O vocabulário `subject-attribute` é global e plano
(`knowledge/domain/glossary/subject-attribute.md` declara só `name`), nada amarra um atributo a um
tipo de sujeito, e `resolveSubjectPlaceholder` só exige que o sujeito **carregue** o atributo, não
vazio (`connector-request-resolver.ts:208`). Bastaria o chamador passar `user-id` **e** `task-seq`.

O bloqueio é inteiramente o `media: {}`.
