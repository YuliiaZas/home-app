import { ICard, IDashboard, IInstrument, ITab, IUserInstrument } from '@models';

export function resolveDashboard({
  dashboard,
  instruments,
  userInstruments,
}: {
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
        if (!instrument) return { error: 'Missing device', instrumentId };

        const userDevice = userInstruments.find((d) => d.instrumentId === instrument.id);

        return {
          ...instrument,
          ...(instrument.type === 'device' ? { state: userDevice?.state ?? false } : {}),
          ...(instrument.type === 'sensor' ? { value: userDevice?.value } : {}),
        };
      }),
    })),
  }));

  return resolved;
}
