import { describe, it, expect } from 'vitest';
import { csvEscape, toCsvRow } from '../../src/services/billing/OrderExport';

describe('OrderExport CSV helpers', () => {
  it('quotes values with commas', () => {
    expect(csvEscape('Acme, Inc.')).toBe('"Acme, Inc."');
  });

  it('doubles quotes inside values', () => {
    expect(csvEscape('The "Big" Shop')).toBe('"The ""Big"" Shop"');
  });

  it('ends every row with a newline', () => {
    expect(toCsvRow(['a', 1, null])).toBe('a,1,\n');
  });
});
