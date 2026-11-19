// Types for lib.mjs (consumed by the Vitest suite; the CLI itself is plain JS).
/* eslint-disable @typescript-eslint/no-explicit-any */
export const KINDS: string[];
export const MODES: string[];
export const ASPECTS: string[];
export const RESOLUTIONS: string[];
export const STATUSES: string[];
export const FOOTAGE_CONTRACT: string[];
export const SCREEN_LAYER_CONTRACT: string[];
export const LOOP_CONTRACT: string[];
export const DEFAULT_CREDIT_RATES: Record<string, Record<string, number>>;
export function validateProduction(prod: any, fileExists?: (rel: string) => boolean): { errors: string[]; warnings: string[] };
export function estimateCredits(shot: any, rates?: Record<string, Record<string, number>>, model?: string): number | null;
export function estimateDraftCredits(rates?: Record<string, Record<string, number>>): number | null;
export function renderPrompt(prod: any, shot: any): string;
export function renderPromptsMarkdown(prod: any, rates?: Record<string, Record<string, number>>): string;
