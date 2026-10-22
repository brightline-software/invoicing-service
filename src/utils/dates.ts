// Two date formats exist in the codebase:
//  - toIsoDate: 2026-10-22 (APIs, logs, anything machine-read)
//  - toLocalDate: 22.10.2026 for RO, 22/10/2026 for FR... (anything a person reads)
// There is no team-wide rule yet for which one CSV exports use.
const LOCALES: Record<string, string> = { RO: 'ro-RO', DE: 'de-DE', FR: 'fr-FR', NL: 'nl-NL' };

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toLocalDate(date: Date, country: string): string {
  return new Intl.DateTimeFormat(LOCALES[country] ?? 'en-GB', { dateStyle: 'short' }).format(date);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000);
}
