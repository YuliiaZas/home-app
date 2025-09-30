import { ICard, IDashboardBase, IInstrumentBase, IInstrumentInput, ITab } from "@models";

export interface IDashboardBaseSeed extends Omit<IDashboardBase, 'tabs'> {
  tabs: (Omit<ITab, 'cards'> & {
    cards: (Omit<ICard, 'items'> & { itemAliasIds: string[] })[];
  })[];
}

export interface IDashboardRawResponse extends Omit<IDashboardBase, 'tabs'> {
  _id: string;
  tabs: (Omit<ITab, 'cards'> & {
    cards: (Omit<ICard, 'items'> & { items: (IInstrumentBase & { _id: string })[] })[];
  })[];
}

export interface IDashboardResponse extends Omit<IDashboardBase, 'tabs'> {
  _id: string;
  tabs: (Omit<ITab, 'cards'> & {
    cards: (Omit<ICard, 'items'> & { items: (IInstrumentInput & { _id: string })[] })[];
  })[];
}
