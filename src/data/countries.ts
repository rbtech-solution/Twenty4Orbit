export type CountryInfo = {
  name: string;
  officialName: string;
  iso: string;
  continent: string;
  subregion: string;
  population: string;
  gdp: string;
  economy: string;
  income: string;
  capital?: string;
};

export function formatPopulation(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  return Math.round(amount).toLocaleString();
}

export function formatGdp(millions: unknown) {
  const amount = Number(millions);
  if (!Number.isFinite(amount) || amount <= 0) return "—";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)} trillion`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)} billion`;
  return `$${amount.toFixed(0)} million`;
}
