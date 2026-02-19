import { describe, expect, it } from 'vitest';

import { OpenClaw } from './OpenClaw.node.js';

describe('OpenClaw node', () => {
  const node = new OpenClaw();

  it('should have correct metadata', () => {
    expect(node.description.name).toBe('openClaw');
    expect(node.description.displayName).toBe('OpenClaw');
    expect(node.description.version).toBe(1);
  });

  it('should require openClawApi credentials', () => {
    expect(node.description.credentials).toEqual([
      { name: 'openClawApi', required: true },
    ]);
  });

  it('should have a resource property', () => {
    const resource = node.description.properties.find(
      (p) => p.name === 'resource',
    );
    expect(resource).toBeDefined();
    expect(resource!.type).toBe('options');
    expect(resource!.required).toBe(true);
  });

  it('should have resource options for all tools', () => {
    const resource = node.description.properties.find(
      (p) => p.name === 'resource',
    );
    const options = resource!.options as Array<{ value: string }>;
    expect(options.length).toBeGreaterThanOrEqual(20);

    // Spot-check a few tools
    const values = options.map((o) => o.value);
    expect(values).toContain('cron');
    expect(values).toContain('sessions_list');
    expect(values).toContain('browser');
    expect(values).toContain('tts');
  });

  it('should have action properties for action-based tools', () => {
    const cronAction = node.description.properties.find(
      (p) =>
        p.name === 'action' &&
        p.displayOptions?.show?.resource?.includes('cron'),
    );
    expect(cronAction).toBeDefined();
    expect(cronAction!.type).toBe('options');
  });

  it('should have raw mode option', () => {
    const rawMode = node.description.properties.find(
      (p) => p.name === 'rawMode',
    );
    expect(rawMode).toBeDefined();
    expect(rawMode!.type).toBe('boolean');
  });
});
