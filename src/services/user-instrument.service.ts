import mongodb from 'mongodb';
import mongoose, { type ClientSession, Types } from 'mongoose';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IInstrumentService, type IUserInstrumentService } from '@interfaces';
import { type IInstrument, type ITab, type IUserInstrument, UserInstrument } from '@models';
import { AppError } from '@utils';

export class UserInstrumentService implements IUserInstrumentService {
  private instrumentService: IInstrumentService;

  constructor() {
    this.instrumentService = DIContainer.resolve<IInstrumentService>(SERVICE_TOKENS.Instrument);
  }

  async updateUserInstrumentState({
    userId,
    instrumentId,
    state,
  }: {
    userId: string;
    instrumentId: string;
    state: boolean;
  }): Promise<IUserInstrument | null> {
    const userInstrument = await UserInstrument.findOne({ userId, instrumentId });
    if (!userInstrument) throw new AppError('User instrument not found', 404);

    userInstrument.state = state;
    await userInstrument.save();

    return userInstrument;
  }

  async getUserInstruments(userId: string): Promise<IUserInstrument[]> {
    return await UserInstrument.find({ userId });
  }

  async updateUserInstrumentsForDashboard({
    userId,
    dashboardId,
    dashboardTabs,
    session = null,
  }: {
    userId: string;
    dashboardId: string;
    dashboardTabs: ITab[];
    session?: ClientSession | null;
  }): Promise<void> {
    const updatedInstrumentIds: string[] = this.getInstrumentIdsFromTabs(dashboardTabs);

    const dashboardObjectId = new Types.ObjectId(dashboardId);

    const existingUserInstruments: IUserInstrument[] = await UserInstrument.find({
      userId,
      dashboards: dashboardId,
    }).session(session);

    const existingUserInstrumentsIds = existingUserInstruments.map((ui) => ui.instrumentId.toString());

    const bulkOptions: mongodb.AnyBulkWriteOperation<IUserInstrument>[] = [];
    let addedInstruments = 0;
    let removedInstruments = 0;

    for (const userInstrument of existingUserInstruments) {
      if (!updatedInstrumentIds.includes(userInstrument.instrumentId.toString())) {
        bulkOptions.push(this.getRemovingOptionForDashboardUserInstrument(dashboardObjectId, userInstrument));
        removedInstruments++;
      }
    }

    for (const instrumentId of updatedInstrumentIds) {
      const instrument = await this.instrumentService.getInstrumentById(instrumentId, session);
      if (!instrument) {
        console.warn(`Instrument with ID ${instrumentId} not found. Skipping.`);
        continue;
      }

      if (!existingUserInstrumentsIds.includes(instrumentId)) {
        bulkOptions.push(
          this.getAddingOptionForDashboardInstrument(userId, dashboardObjectId, instrument)
        );
        addedInstruments++;
      }
    }

    if (bulkOptions.length > 0) {
      await UserInstrument.bulkWrite(bulkOptions, { session: session || undefined });
    }

    console.log(
      `✅ Updated UserInstruments for user '${userId}' and dashboard '${dashboardId}'. Added: ${addedInstruments}, Removed: ${removedInstruments}`
    );
  }

  async removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }) {
    const dashboardObjectId = new Types.ObjectId(dashboardId);

    const userInstrumentsForDashboard = await UserInstrument.find<IUserInstrument>({
      userId,
      dashboards: dashboardId,
    });

    const bulkOptions: mongodb.AnyBulkWriteOperation<IUserInstrument>[] = [];

    for (const userInstrument of userInstrumentsForDashboard) {
      bulkOptions.push(this.getRemovingOptionForDashboardUserInstrument(dashboardObjectId, userInstrument));
    }

    if (bulkOptions.length > 0) {
      await UserInstrument.bulkWrite(bulkOptions);
    }
  }

  async getUserInstrumentsMapByDashboardId(userId: string, dashboardId: string): Promise<Map<string, IUserInstrument>> {
    return await UserInstrument.find<IUserInstrument>({
      userId,
      dashboards: dashboardId,
    }).lean().then(uis => new Map(uis.map(ui => [ui.instrumentId.toString(), ui])));
  }

  private getRemovingOptionForDashboardUserInstrument(
    dashboardObjectId: Types.ObjectId,
    userInstrument: IUserInstrument
  ): mongodb.AnyBulkWriteOperation<IUserInstrument> {
    if (userInstrument.dashboards.length === 1) {
      return {
        deleteOne: {
          filter: { _id: userInstrument._id },
        },
      };
    }
    return {
      updateOne: {
        filter: { _id: userInstrument._id},
        update: { $pull: { dashboards: dashboardObjectId } as mongoose.mongo.BSON.Document }
      },
    };
  }

  private getAddingOptionForDashboardInstrument(
    ownerUserId: string,
    dashboardObjectId: Types.ObjectId,
    instrument: IInstrument
  ): mongodb.AnyBulkWriteOperation<IUserInstrument> {
    const userId = new Types.ObjectId(ownerUserId) as unknown as IUserInstrument['userId'];
    const userIdC = new Types.ObjectId(ownerUserId) as unknown as mongodb.Condition<mongoose.Schema.Types.ObjectId>;
    return {
      updateOne: {
        filter: { userId: userIdC, instrumentId: instrument._id },
        update: {
          $setOnInsert: {
            userId,
            instrumentId: instrument._id,
            state: instrument?.type === 'device' ? instrument.state ?? false : undefined,
            value: instrument?.type === 'sensor'
              ? { amount: instrument.value?.amount ?? 0, unit: instrument.value?.unit ?? null }
              : undefined,
          },
          $addToSet: { dashboards: dashboardObjectId } as mongoose.mongo.BSON.Document,
        },
        upsert: true,
      },
    };
  }

  private getInstrumentIdsFromTabs(tabs: ITab[]): string[] {
    try {
      return tabs.flatMap((tab) => tab.cards.flatMap((card) => card.items.map(item => item.toString())));
    } catch {
      throw new AppError('Invalid tabs format', 400);
    }
  }
}
