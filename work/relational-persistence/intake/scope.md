# Escopo — persistência relacional

Recebido em 2026-08-11, como o humano o forneceu.

Invocação: `/plan-work` — project root `/home/siegfriedneto/projects/siegardtest`,
target `backend`, initiative `relational-persistence`.

---

Escopo — substituir toda a persistência em arquivo por um banco relacional,
entregando o sistema funcionando de ponta a ponta contra ele.

Hoje quatro stores gravam JSON em disco: casos, glossário, registro de
capacidades e investigações, em src/persistence/. Os quatro passam a responder
do banco, atrás das portas que já existem — ICaseStore, IGlossaryStore,
ICapabilityStore, IInvestigationStore — sem que o domínio importe driver.

O schema é criado por migrations SQL ordenadas sob migrations/, e as tabelas e
colunas espelham os elementos declarados na especificação.

O código precisa acompanhar o que a especificação passou a dizer: hash sai de
Case e de PinnedCase, e o pin de replay passa a ser slug e version; Hypothesis
declara position, e a precedência é lida dela; Investigation ganha written_at;
a versão de caso ganha authored_at. Uma versão de caso é escrita uma vez e
nunca alterada, um caso é lido inteiro numa transação, e dois casos não
compartilham slug.

O curador passa a autorar contra o banco pelo comando que
contracts/knowledge/author-case-version publica — não existe mais arquivo de
caso.

A suíte roda contra um banco com o schema aplicado; nenhum dos cinco steps que
o standard declara aplica migration hoje.

O banco é provisionado fora do deployment, no Neon, e alcançado por uma URL de
configuração.
