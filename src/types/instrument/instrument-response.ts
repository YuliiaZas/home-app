import { type IInstrument } from "@models";

export enum INSTRUMENT_KEYS {
  '_id',
  'type',
  'icon',
  'label'
}

export type IInstrumentResponse = Pick<Required<IInstrument>, keyof typeof INSTRUMENT_KEYS>;
