export function roundToFifty(value: number) {
  return Math.round(value / 50) * 50;
}

export function formatLiters(value: number, locale: string, unit: string) {
  return `${(value / 1000).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} ${unit}`;
}
