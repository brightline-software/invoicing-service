import { Money } from '../../utils/money.js';

// Standard VAT rates we invoice with. Reverse charge (B2B inside the EU) is
// handled by the caller passing country = 'EU-RC'.
const VAT_RATES: Record<string, number> = {
  RO: 0.19,
  DE: 0.19,
  FR: 0.2,
  NL: 0.21,
  'EU-RC': 0,
};

export function vatRate(country: string): number {
  const rate = VAT_RATES[country];
  if (rate === undefined) throw new Error(`No VAT rate configured for ${country}`);
  return rate;
}

export function calculateVat(net: Money, country: string): Money {
  return net.multiply(vatRate(country));
}
