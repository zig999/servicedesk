export const CONSOLIDATION_REGISTERS = ['formal', 'plain'] as const;

export type ConsolidationRegister = (typeof CONSOLIDATION_REGISTERS)[number];
