function enumKeysToArray(e: object): string[] {
  return Object.keys(e).filter(k => isNaN(Number(k)));
}

export function enumKeysToSelector(e: object, keepId = true): string {
  const selector = enumKeysToArray(e).join(' ');
  return keepId ? selector : selector + ' -_id';
}
