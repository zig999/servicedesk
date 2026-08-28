// A no-cache composition/factory for simulation
// (task/case-simulation-pipeline/no-cache-simulation-composition,
// contracts/investigation/case-simulation): wires the shared
// investigation-pipeline.ts's own runInvestigationPipeline() — stages 1-4
// alone, never buildInvestigation or a write step
// (rules/investigation/a-simulation-writes-no-investigation) — as a
// distinct assembly, parallel to production-diagnose.factory.ts rather than
// a conditional branch inside it or inside diagnose.factory.ts. Neither
// runDiagnosis nor createDiagnoseRunner nor createProductionDiagnoseRunner
// is imported or called from here.
//
// Mirrors createDiagnoseRunner's own generic per-context shape
// (diagnose.factory.ts) for every adapter this run's own caller still
// chooses — evaluator, consolidator, poolSize, defaultConsolidationRegister
// — rather than production-diagnose.factory.ts's own Anthropic-fixing
// shape: this factory's own caller picks the concrete judgment and
// consolidation adapters, exactly as createDiagnoseRunner's own caller
// does.
//
// The one deliberate departure from that generic shape is the observation
// source itself. Accepting it as a caller-supplied IObservationSource, the
// way createDiagnoseRunner does, would leave this module unable to tell a
// plain adapter apart from a caching decorator implementing the same
// published port — a fact no type signature can rule out. So this factory
// constructs its own HttpDeclarativeObservationSource directly, once per
// call to this outer factory, from the given connection's own capability
// and connector-configuration reads — the same concrete, cache-free adapter
// diagnose-server.factory.ts already constructs for production. No caching
// decorator or layer exists anywhere in this tree today (this initiative's
// own inventory), so there is none to strip out here; what this factory
// guarantees instead is that none can ever be introduced through it later
// without changing this file's own body, since it accepts no
// externally-built IObservationSource at all — nothing this module
// imports, constructs or takes as a parameter can be a cache, so nothing a
// simulation collects through it can enter one, regardless of whether one
// is ever added to diagnose's own, separate observation-source composition
// (scenarios/investigation/a-simulation-never-enters-the-cache).
//
// Every adapter below — capabilities, connectorConfigurations and the
// observation source itself — is constructed exactly once per call to this
// outer factory function, the same per-deployment convention
// createDiagnoseRunner and createProductionDiagnoseRunner already keep for
// their own leaf dependencies, never once per request.

import type { IAssessmentConsolidator } from '../investigation/assessment-consolidator.port.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import { HttpDeclarativeObservationSource } from '../investigation/http-declarative-observation-source.adapter.js';
import type { IHypothesisEvaluator } from '../investigation/hypothesis-evaluator.port.js';
import {
  runInvestigationPipeline,
  type InvestigationPipelineOptions,
  type InvestigationPipelineResult,
} from '../investigation/investigation-pipeline.js';
import type { DatabaseConnection } from '../persistence/database-connection.js';
import { createCapabilityQuery } from './capability-registry.factory.js';
import { createConnectorConfigurationRegistry } from './connector-configuration-registry.factory.js';

/**
 * What one simulation run's own caller still chooses, once this factory has
 * fixed the one connection every read below answers from and constructed
 * its own cache-free observation source: the judgment and consolidation
 * adapters, the configured judgment pool bound
 * (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "the
 * pool bound is configuration") and the register to fall back to where a
 * case leaves consolidation_register undeclared — the same per-deployment
 * fields createDiagnoseRunner's own DiagnoseDependencies already names for
 * the identical reason, generic rather than fixed to any one provider.
 */
export type SimulationDependencies = {
  readonly connection: DatabaseConnection;
  readonly evaluator: IHypothesisEvaluator;
  readonly consolidator: IAssessmentConsolidator;
  readonly poolSize: number;
  readonly defaultConsolidationRegister: ConsolidationRegister;
};

/**
 * Everything one simulation call still needs to supply once this factory
 * has wired every fixed dependency above: runInvestigationPipeline's own
 * InvestigationPipelineOptions minus exactly the fields this factory itself
 * wires (capabilities, observationSource, evaluator, consolidator,
 * poolSize, defaultConsolidationRegister) — subjectType, subjectAttributes,
 * the pinned case, the requester and the propagated (now, deadline) pair
 * are this call's own to supply. Carries no id, ticket_ref, narrative,
 * prompt_version, model, glossary or store: those are RunDiagnosisOptions'
 * own persistence-only fields, never reached here since this factory never
 * calls runDiagnosis or buildInvestigation
 * (contracts/investigation/case-simulation's own "neither operation carries
 * a narrative or a ticket reference").
 */
export type SimulationCall = Omit<
  InvestigationPipelineOptions,
  'capabilities' | 'observationSource' | 'evaluator' | 'consolidator' | 'poolSize' | 'defaultConsolidationRegister'
>;

/**
 * Wires a simulation's own run of the shared investigation pipeline
 * (task/case-simulation-pipeline/no-cache-simulation-composition,
 * contracts/investigation/case-simulation): calls
 * investigation-pipeline.ts's own runInvestigationPipeline directly and
 * answers its whole record — evidence, evaluations, resolved, assessment,
 * cost, durations and prompts — never buildInvestigation, never a write and
 * never an event (rules/investigation/a-simulation-writes-no-investigation).
 * A distinct assembly from createDiagnoseRunner and
 * createProductionDiagnoseRunner — neither is imported or called here — and
 * this factory adds no flag or branch that would choose between a cached
 * and an uncached path: the observation source it constructs below is the
 * only one this factory ever offers, unconditionally, every time it is
 * called.
 */
export function createSimulationRunner(
  dependencies: SimulationDependencies,
): (call: SimulationCall) => Promise<InvestigationPipelineResult> {
  const capabilities = createCapabilityQuery(dependencies.connection);
  const connectorConfigurations = createConnectorConfigurationRegistry(dependencies.connection);
  const observationSource = new HttpDeclarativeObservationSource({ capabilities, connectorConfigurations });
  return (call: SimulationCall): Promise<InvestigationPipelineResult> =>
    runInvestigationPipeline({
      ...call,
      capabilities,
      observationSource,
      evaluator: dependencies.evaluator,
      consolidator: dependencies.consolidator,
      poolSize: dependencies.poolSize,
      defaultConsolidationRegister: dependencies.defaultConsolidationRegister,
    });
}
