import mongodb from 'mongodb';
import mongoose, { ClientSession, Types } from 'mongoose';
import { IUserInstrumentService } from '@interfaces';
import { IInstrument, Instrument, IUserInstrument, UserInstrument } from '@models';

export class UserInstrumentService implements IUserInstrumentService {
  async updateUserInstrumentsForDashboard({
    userId,
    dashboardId,
    updatedInstrumentIds,
    session = null,
  }: {
    userId: string;
    dashboardId: string;
    updatedInstrumentIds: string[];
    session?: ClientSession | null;
  }): Promise<{ dashboardId: string; addedInstruments: number; removedInstruments: number }> {
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
      const instrument = await Instrument.findById(instrumentId).session(session);
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

    return {
      dashboardId,
      addedInstruments,
      removedInstruments,
    };
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
}
