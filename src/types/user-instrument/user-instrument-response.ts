import { IUserInstrument } from "@models";
import { IInstrumentResponse } from "../instrument";

export enum USER_INSTRUMENT_KEYS {
  '_id',
  'instrumentId',
  'dashboards',
  'value',
  'state',
  'aliasLabel',
}

export type IUserInstrumentResponse = Pick<IUserInstrument, keyof typeof USER_INSTRUMENT_KEYS> & {
  instrument: IInstrumentResponse;
};
