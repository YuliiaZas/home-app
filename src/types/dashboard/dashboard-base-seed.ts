import { ICard, IDashboardBase, ITab } from "@models";

export interface IDashboardBaseSeed extends Omit<IDashboardBase, 'tabs'> {
  tabs: (Omit<ITab, 'cards'> & {
    cards: (Omit<ICard, 'items'> & {
      itemAliasIds: string[]
    })[];
  })[];
}
