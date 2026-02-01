export function isIsoDate(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

export function assertIsoDate(d: string) {
  if (!isIsoDate(d)) throw new Error("Date must be YYYY-MM-DD");
}

