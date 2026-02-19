import { describe, expect, it } from 'vitest';

import { toolSchemas } from './toolSchemas.js';

describe('toolSchemas', () => {
  it('should load all 20 tool schemas', () => {
    expect(toolSchemas).toHaveLength(20);
  });

  it('should have unique names', () => {
    const names = toolSchemas.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should have required fields on every schema', () => {
    for (const schema of toolSchemas) {
      expect(schema.name).toBeTruthy();
      expect(schema.label).toBeTruthy();
      expect(schema.description).toBeTruthy();
      expect(schema.parameters).toBeDefined();
    }
  });

  it('should have action-based tools with actions array', () => {
    const cron = toolSchemas.find((s) => s.name === 'cron');
    expect(cron).toBeDefined();
    expect(cron!.actions).toContain('list');
    expect(cron!.actions).toContain('add');
    expect(cron!.parameters.action).toBeDefined();
    expect(cron!.parameters.action.required).toBe(true);
  });

  it('should have non-action tools without actions array', () => {
    const tts = toolSchemas.find((s) => s.name === 'tts');
    expect(tts).toBeDefined();
    expect(tts!.actions).toBeUndefined();
  });

  it('should be sorted by label', () => {
    const labels = toolSchemas.map((s) => s.label);
    const sorted = [...labels].sort((a, b) => a.localeCompare(b));
    expect(labels).toEqual(sorted);
  });
});
