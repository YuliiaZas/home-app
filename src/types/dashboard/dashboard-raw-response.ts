import { IDashboardBase, ITab } from "@models";
import { IInstrumentResponse } from "../instrument";

export type IDashboardRawResponse = Omit<IDashboardBase, 'tabs'> & {
  _id: string;
  tabs: ITab<IInstrumentResponse>[];
}
