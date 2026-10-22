import { describe, it, expect } from 'vitest';
import { calculateVat, vatRate } from '../../src/services/billing/tax';
import { Money } from '../../src/utils/money';

describe('VAT', () => {
  it('uses 19% for Romania', () => {
    expect(calculateVat(Money.fromCents(10_000, 'RON'), 'RO').cents).toBe(1_900);
  });

  it('charges nothing for EU reverse charge', () => {
    expect(vatRate('EU-RC')).toBe(0);
  });

  it('throws for an unknown country', () => {
    expect(() => vatRate('XX')).toThrow(/No VAT rate/);
  });
});
