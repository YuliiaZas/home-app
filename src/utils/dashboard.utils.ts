import { IInstrumentInput, ITab, IUserInstrument } from '@models';
import { IDashboardRawResponse, IDashboardResponse } from '@types';

export function resolveDashboard({ dashboard, userInstrumentMap }: {
  dashboard: IDashboardRawResponse;
  userInstrumentMap: Map<string, IUserInstrument>;
}): IDashboardResponse {
  return {
    ...dashboard,
    tabs: (dashboard.tabs || []).map((tab) => ({
      ...tab,
      cards: (tab.cards || []).map((card) => ({
        ...card,
        items: (card.items || []).map((instrument) => {
          const userDevice = userInstrumentMap.get(instrument._id.toString());
          const resolvedInstrument: IInstrumentInput & { _id: string } = {
            ...instrument,
            label: userDevice?.aliasLabel || instrument.label,
            ...(userDevice?.state !== undefined ? { state: userDevice?.state } : {}),
            ...(userDevice?.value !== undefined ? { value: userDevice?.value } : {}),
          }

          return resolvedInstrument;
        }),
      })),
    })),
  };
}

export function validateTabAliasIds(tabs: ITab[]): string | null {
  const aliasIdSet = new Set<string>();
  for (const tab of tabs) {
    if (tab.aliasId) {
      if (aliasIdSet.has(tab.aliasId)) {
        return tab.aliasId;
      }
      aliasIdSet.add(tab.aliasId);
    }
  }
  return null;
}
