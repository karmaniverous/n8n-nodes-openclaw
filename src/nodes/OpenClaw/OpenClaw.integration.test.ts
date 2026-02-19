import { describe, expect, it } from 'vitest';

/**
 * Integration test: calls the OpenClaw Gateway directly to verify
 * the /tools/invoke endpoint works as expected.
 * Requires a running gateway at http://127.0.0.1:18789.
 */
describe('OpenClaw Gateway integration', () => {
  const gatewayUrl = 'http://127.0.0.1:18789';

  // Read token from environment or skip
  const gatewayToken = process.env['OPENCLAW_TOKEN'] ?? '';

  it.skipIf(!gatewayToken)(
    'should call sessions_list via /tools/invoke',
    async () => {
      const response = await fetch(`${gatewayUrl}/tools/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gatewayToken}`,
        },
        body: JSON.stringify({
          tool: 'sessions_list',
          args: { limit: 1 },
        }),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as { ok: boolean };
      expect(data.ok).toBe(true);
    },
  );

  it.skipIf(!gatewayToken)(
    'should call session_status via /tools/invoke',
    async () => {
      const response = await fetch(`${gatewayUrl}/tools/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gatewayToken}`,
        },
        body: JSON.stringify({
          tool: 'session_status',
          args: {},
        }),
      });

      expect(response.ok).toBe(true);
      const data = (await response.json()) as { ok: boolean };
      expect(data.ok).toBe(true);
    },
  );
});
