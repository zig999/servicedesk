#!/usr/bin/env node
// Registro operacional dos cinco cadastros que a cadeia do conceito
// perfil-mobile-tecnico exige, mais o caso de sonda que a torna chamável.
//
// O QUE ISTO É: um comando de pessoa. Escreve no banco através dos serviços
// já publicados da própria aplicação e de nenhum outro caminho — nada de SQL
// próprio além das duas inserções de concept que o próprio seed.ts também faz
// direto, porque o port do glossário não declara escrita de concept (o
// ADVISORY está registrado lá).
//
// O QUE ISTO NÃO É: código entregue. Mora fora da raiz de código-alvo
// (siegard.json declara target backend = src/), então não passa por task, não
// responde ao standard e não entra no rastro. O caminho permanente — um
// seedConnectors ao lado de seedCapabilities, mais os dados nas fixtures — é
// trabalho de /plan-work, e é o que substitui este arquivo.
//
// POR QUE NÃO loadEnv(): config/env.ts valida o schema inteiro da superfície
// HTTP (PAGINATION_DEFAULT_LIMIT, CONSOLIDATOR_MODEL, POOL_SIZE, ...). Este
// script precisa de DATABASE_URL e de mais nada, e falhar por uma variável que
// ele não usa seria uma recusa sem conteúdo.
//
// COMO RODAR, da raiz do repositório:
//   node --env-file=src/.env docs/cases/_registry/register.mjs --dry-run
//   node --env-file=src/.env docs/cases/_registry/register.mjs
//
// Rodar de novo é seguro: os vocabulários entram por insertMissingTerms
// (aditivo), o concept por ON CONFLICT DO NOTHING, a capability e o connector
// substituem na mesma identidade, e o caso é guardado por uma leitura prévia —
// uma versão liberada é imutável e nunca é reescrita.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CASES = join(HERE, '..');
const DIST = join(HERE, '..', '..', '..', 'src', 'dist');
const DRY_RUN = process.argv.includes('--dry-run');

// Os cinco cadastros da tabela, nomeados um a um para que este arquivo possa
// ser conferido contra ela sem ser lido inteiro.
const SUBJECT_TYPE = 'technician';
const SUBJECT_ATTRIBUTE = 'user-id';
const CONCEPT = 'perfil-mobile-tecnico';
const CAPABILITY = 'perfil-mobile-tecnico-reader';
const CONNECTOR = 'ifs-fsm-tech-profile-connector';

// O sexto item: sem um caso pinado, POST /v1/diagnose não tem o que chamar.
const PROBE_CASE = '_registry/probe/perfil-mobile-tecnico-probe.case.json';

const load = async (relative) => import(pathToFileURL(join(DIST, relative)).href);
const readJson = async (relative) => JSON.parse(await readFile(join(CASES, relative), 'utf8'));

const { createDatabaseConnection } = await load('persistence/database-connection.js');
const { RelationalGlossaryStore } = await load('persistence/relational-glossary-store.repository.js');
const { NON_CONCLUSION_OUTCOMES } = await load('glossary/terms.js');
const { createCapabilityRegistry } = await load('factories/capability-registry.factory.js');
const { createConnectorConfigurationRegistry } = await load('factories/connector-configuration-registry.factory.js');
const { createCaseLifecycle } = await load('factories/case-lifecycle.factory.js');
const { createCaseStore } = await load('factories/case-store.factory.js');
const { createCaseQuery } = await load('factories/case-query.factory.js');

const step = (n, what) => console.log(`${DRY_RUN ? '[dry-run] ' : ''}${n}. ${what}`);

/**
 * Os cinco vocabulários publicados, cada um pelo arquivo curado que o declara.
 * outcome vai primeiro e junto com os dois outcomes de não-conclusão que o
 * fallback do caso de sonda cita, pela mesma regra que seedOutcomes segue
 * (rules/glossary/the-non-conclusion-outcomes-precede-the-first-case).
 */
async function registerVocabularies(glossary) {
  const outcomes = await readJson('_glossary/outcome.json');
  const declared = new Set(outcomes.map((term) => term.name));
  const missing = NON_CONCLUSION_OUTCOMES.filter((term) => !declared.has(term.name));
  const plan = [
    ['outcome', [...outcomes, ...missing]],
    ['subject-type', await readJson('_glossary/subject-type.json')],
    ['subject-attribute', await readJson('_glossary/subject-attribute.json')],
    ['action', await readJson('_glossary/action.json')],
    ['recipient', await readJson('_glossary/recipient.json')],
  ];
  for (const [vocabulary, terms] of plan) {
    step('1', `${vocabulary}: ${terms.map((t) => t.name).join(', ')}`);
    if (!DRY_RUN) {
      await glossary.insertMissingTerms(vocabulary, terms);
    }
  }
}

/**
 * O concept, e só ele: as duas mesmas inserções parametrizadas que
 * seedConcepts roda, na ordem que as chaves estrangeiras exigem —
 * concept_accepts.subject_type_name referencia subject_types.name, já escrito
 * acima. Os outros dois concepts do arquivo curado ficam de fora porque suas
 * capabilities não estão sendo registradas.
 */
async function registerConcept(connection) {
  const concepts = await readJson('_glossary/concept.json');
  const concept = concepts.find((candidate) => candidate.name === CONCEPT);
  if (concept === undefined) {
    throw new Error(`_glossary/concept.json não declara ${CONCEPT}`);
  }
  step('2', `concept ${concept.name} (ttl ${concept.ttl}, accepts ${concept.accepts.join(', ')})`);
  if (DRY_RUN) {
    return;
  }
  await connection.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
    concept.name,
    concept.ttl,
  ]);
  for (const subjectType of concept.accepts) {
    await connection.query(
      'INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [concept.name, subjectType],
    );
  }
}

/** A capability, pelo caminho de escrita validado do próprio registro. */
async function registerCapability(connection) {
  const registration = await readJson(`_registry/capabilities/${CAPABILITY}.capability.json`);
  step('3', `capability ${registration.name} v${registration.version} -> connector ${registration.connector}`);
  if (!DRY_RUN) {
    await createCapabilityRegistry(connection).registerCapability(registration);
  }
}

/** O connector. O payload vai inteiro e opaco, como o registro o guarda. */
async function registerConnector(connection) {
  const registration = await readJson(`_registry/connectors/${CONNECTOR}.connector.json`);
  step('4', `connector ${registration.connector} -> ${registration.configuration.address}`);
  if (!DRY_RUN) {
    await createConnectorConfigurationRegistry(connection).registerConnector(registration);
  }
}

/**
 * O caso de sonda, pelas quatro operações de ciclo de vida e por nenhuma outra
 * escrita — createDraft, reviseHypothesis e placeHypothesis por hipótese na
 * ordem declarada, release ao fim. A mesma sequência de seedCase.
 */
async function registerProbeCase(connection) {
  const document = await readJson(PROBE_CASE);
  let held;
  try {
    held = await createCaseStore(connection).assembleVersion(document.slug, document.version);
  } catch (cause) {
    // Uma leitura do store de casos que falha aqui quase sempre é o schema do
    // banco atrás do código, não o caso: a leitura monta a versão inteira e
    // toca as tabelas que as migrations de ciclo de vida criam.
    throw new Error(
      'a leitura do store de casos falhou antes de qualquer escrita — confira se as migrations ' +
        'de ciclo de vida (0009, 0010) estão aplicadas neste banco. Causa original: ' +
        String(cause?.cause?.message ?? cause?.message ?? cause),
    );
  }
  if (held !== undefined) {
    step('5', `caso ${document.slug} v${document.version} já está no banco — nada a escrever`);
    return;
  }
  step('5', `caso ${document.slug} v${document.version}, ${document.manifest.length} hipóteses, release ao fim`);
  if (DRY_RUN) {
    return;
  }
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: document.slug,
    title: document.title,
    when_to_use: document.when_to_use,
    authored_at: document.authored_at,
    subject: document.subject,
    fallback: document.fallback,
    consolidation_register: document.consolidation_register,
  });
  for (const entry of document.manifest) {
    const revised = await lifecycle.reviseHypothesis({
      slug: document.slug,
      hypothesis_name: entry.hypothesis_name,
      criterion: entry.criterion,
      collects: entry.collects,
      resolution: entry.resolution,
      subject: document.subject,
    });
    await lifecycle.placeHypothesis({
      slug: document.slug,
      version: draft.version,
      hypothesis_name: revised.hypothesis_name,
      revision: revised.revision,
      position: entry.position,
    });
  }
  await lifecycle.release(document.slug, draft.version);
}

/**
 * Lê o caso de volta inteiro pela consulta publicada, que roda a mesma
 * validação de coerência de toda leitura — se o concept, a capability ou um
 * termo faltasse, é aqui que este script falha em vez de sair calado.
 */
async function verify(connection) {
  const document = await readJson(PROBE_CASE);
  step('6', `conferência: leitura de ${document.slug} v${document.version} pela consulta publicada`);
  if (DRY_RUN) {
    return;
  }
  // readCase devolve { case: ... } — o documento inteiro, montado e validado.
  const { case: read } = await createCaseQuery(connection).readCase(document.slug, document.version);
  const positions = read.manifest
    .map((entry) => `${entry.position}:${entry.hypothesis_revision.hypothesis.name}`)
    .join(', ');
  console.log(`   lido: estado ${read.state}, manifest ${positions}`);
}

const connectionUrl = process.env.DATABASE_URL;
if (connectionUrl === undefined || connectionUrl === '') {
  throw new Error('DATABASE_URL não está no ambiente — rode com --env-file=src/.env');
}

const connection = createDatabaseConnection(connectionUrl);
try {
  await registerVocabularies(new RelationalGlossaryStore(connection));
  await registerConcept(connection);
  await registerCapability(connection);
  await registerConnector(connection);
  await registerProbeCase(connection);
  await verify(connection);
  console.log(DRY_RUN ? '\ndry-run: nada foi escrito.' : '\npronto.');
} finally {
  await connection.end();
}
