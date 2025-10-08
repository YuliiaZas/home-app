export function validateCardOrder(entities: { _id: string; order: number }[]): {order: number, duplicationIds?: string[], overMaxId?: string} | null {
  const orderValueIdMap = new Map<number, string>();

  for (const entity of entities) {
    const { _id, order } = entity;
    if (order !== undefined && order !== null) {
      if (orderValueIdMap.has(order)) {
        return {
          order,
          duplicationIds: [orderValueIdMap.get(order)!, _id],
        };
      }

      if (order > entities.length - 1) {
        return {
          order,
          overMaxId: _id,
        };
      }

      orderValueIdMap.set(order, _id);
    }
  }

  return null;
}
