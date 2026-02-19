import { describe, expect, it } from 'vitest';

import { OpenClawApi } from './OpenClawApi.credentials.js';

describe('OpenClawApi credential', () => {
  const cred = new OpenClawApi();

  it('should have correct name', () => {
    expect(cred.name).toBe('openClawApi');
  });

  it('should have gatewayUrl and gatewayToken properties', () => {
    const names = cred.properties.map((p) => p.name);
    expect(names).toContain('gatewayUrl');
    expect(names).toContain('gatewayToken');
  });

  it('should have gatewayToken as password type', () => {
    const token = cred.properties.find((p) => p.name === 'gatewayToken');
    expect(token!.typeOptions?.password).toBe(true);
  });

  it('should have a default gateway URL', () => {
    const url = cred.properties.find((p) => p.name === 'gatewayUrl');
    expect(url!.default).toBe('http://127.0.0.1:18789');
  });
});
