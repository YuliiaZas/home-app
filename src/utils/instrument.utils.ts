import { IInstrument, ITab } from '@models';
import { AppError } from './errors.utils';

export function validateInstrumentData(
  type: IInstrument['type'],
  state?: boolean,
  value?: IInstrument['value']
): string | null {
  if (type === 'device') {
    if (value?.amount !== undefined) {
      return 'Devices cannot have "value" defined';
    }
    if (state === undefined) {
      return '"state" is required for devices';
    }
  }

  if (type === 'sensor') {
    if (state !== undefined) {
      return 'Sensors cannot have "state" defined';
    }
    if (value?.amount === undefined) {
      return '"value.amount" is required for sensors';
    }
    if (value?.amount !== undefined && !['number', 'string', 'boolean'].includes(typeof value.amount)) {
      return '"value.amount" must be number, string, or boolean';
    }
  }

  return null;
}

export function getInstrumentIdsFromTabs(tabs: ITab[]): string[] {
  try {
    return tabs.flatMap((tab) => tab.cards.flatMap((card) => card.items));
  } catch {
    throw new AppError('Invalid tabs format', 400);
  }
}
