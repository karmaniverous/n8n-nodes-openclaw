import { expect, suite, test } from 'vitest';

import { foo } from './';

suite('foo', () => {
  test('should allow expression assertions', () => {
    expect(true).toBe(true);
  });

  test('should prefix bar', () => {
    expect(foo('bar')).toBe('foo bar');
  });
});
