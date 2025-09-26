import { Instrument, ITab } from '@models';

export class InstrumentService {
  static async validateInstrumentsInTabs(tabs: ITab[]): Promise<{ message: string; invalidIds?: string[]; } | null> {
    const allInstrumentIds = this.getInstrumentsFromTabs(tabs) || [];
    const existingInstruments = await Instrument.find({
      _id: { $in: allInstrumentIds }
    }).select('_id');

    const existingIds = existingInstruments.map(inst => inst._id.toString());
    const invalidIds = allInstrumentIds.filter(id => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      return { message: 'Invalid instrument IDs', invalidIds };
    }
    return null;
  }

  static getInstrumentsFromTabs(tabs: ITab[]): string[] {
    return tabs.flatMap((tab) => tab.cards.flatMap((card) => card.items));
  }
}
