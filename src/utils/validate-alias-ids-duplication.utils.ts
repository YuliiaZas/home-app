export function validateAliasIdsDuplication(entities: { aliasId: string }[]): string | null {
  const aliasIdSet = new Set<string>();
  for (const entity of entities) {
    const { aliasId } = entity;
    if (aliasId) {
      if (aliasIdSet.has(aliasId)) {
        return aliasId;
      }
      aliasIdSet.add(aliasId);
    }
  }
  return null;
}
