export function numberFormat(value: number | string): string {
  if (!value) return "0";

  return value
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


export function unformatNumber(value: string): number {
  return Number(value.replace(/\./g, ""));
}
