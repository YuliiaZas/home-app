import { IInstrument, IUserInstrument } from "@models";

export enum DASHBOARD_USER_INSTRUMENT_KEYS {
  '_id',
  'value',
  'state',
  'aliasLabel',
}

export enum DASHBOARD_INSTRUMENT_KEYS {
  'type',
  'icon',
  'label'
}

export type IDashboardUserInstrumentResponse = Pick<IUserInstrument, keyof typeof DASHBOARD_USER_INSTRUMENT_KEYS> & Pick<Required<IInstrument>, keyof typeof DASHBOARD_INSTRUMENT_KEYS>;
