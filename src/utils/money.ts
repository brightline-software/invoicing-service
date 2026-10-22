// Money is always stored in cents (integers). Never use floats for amounts.
export class Money {
  private constructor(readonly cents: number, readonly currency: string) {}

  static fromCents(cents: number, currency: string) {
    return new Money(Math.round(cents), currency);
  }

  static zero(currency: string) {
    return new Money(0, currency);
  }

  add(other: Money) {
    if (other.currency !== this.currency) throw new Error('Currency mismatch');
    return new Money(this.cents + other.cents, this.currency);
  }

  multiply(factor: number) {
    return new Money(Math.round(this.cents * factor), this.currency);
  }

  toDecimalString() {
    return (this.cents / 100).toFixed(2);
  }

  format(locale = 'en-GB') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(this.cents / 100);
  }
}
