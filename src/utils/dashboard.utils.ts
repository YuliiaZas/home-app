import { ICard, IDashboard, IInstrument, ITab, IUserInstrument } from "@models";

export function resolveDashboard({dashboard, instruments, userInstruments}: {
  dashboard: IDashboard;
  instruments: IInstrument[];
  userInstruments: IUserInstrument[];
}) {
  const resolved = JSON.parse(JSON.stringify(dashboard));

  resolved.tabs = (resolved.tabs || []).map((tab: ITab) => ({
    ...tab,
    cards: (tab.cards || []).map((card: ICard) => ({
      ...card,
      items: (card.items || []).map((instrumentId) => {
        const instrument = instruments.find((d) => d._id === instrumentId);
        if (!instrument) return { error: "Missing device", instrumentId };

        const userDevice = userInstruments.find((d) => d.instrumentId === instrument.id);

        return {
          ...instrument,
          ...(instrument.type === "device" ? { state: userDevice?.state ?? false } : {}),
          ...(instrument.type === "sensor" ? { value: userDevice?.value } : {}),
        };
      }),
    })),
  }));

  return resolved;
}

export function isTab(obj: unknown): obj is ITab {
  return isObject(obj) && 'title' in obj && 'cards' in obj && Array.isArray(obj.cards) &&
   obj.cards.every((card: unknown) => isCard(card));
}
export function isCard(obj: unknown): obj is ICard {
  return isObject(obj) && 'title' in obj && 'layout' in obj && isCardLayout(obj.layout)
   && 'items' in obj && isCardItems(obj.items);
}
export function isCardLayout(layout: unknown): layout is ICard["layout"] {
  return typeof layout === 'string' && ['verticalLayout', 'horizontalLayout', 'singleDevice'].includes(layout);
}
export function isCardItems(items: unknown): items is ICard["items"] {
  return Array.isArray(items) && items.every((item: unknown) => typeof item === 'string');
}
export function isObject(obj: unknown): obj is Record<string, unknown> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}