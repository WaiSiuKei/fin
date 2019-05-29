export function isFalsyOrWhitespace(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return true;
  }
  return str.trim().length === 0;
}
