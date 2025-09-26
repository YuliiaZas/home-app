import mongodb from 'mongodb';
import mongoose, { ClientSession, Types } from 'mongoose';
import { IUserInstrument, UserInstrument } from '@models';

export class UserInstrumentService {
  static async updateUserInstrumentsForDashboard({
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
    console.log(updatedInstrumentIds.length)
    const dashboardObjectId = new Types.ObjectId(dashboardId);

    const existingUserInstruments: IUserInstrument[] = await UserInstrument.find({
      userId,
      dashboards: dashboardId,
    }).session(session);

    const existingUserInstrumentsIds = existingUserInstruments.map((ui) => ui.instrumentId.toString());

    const bulkOptions: mongodb.AnyBulkWriteOperation[] = [];
    let addedInstruments = 0;
    let removedInstruments = 0;

    for (const userInstrument of existingUserInstruments) {
      if (!updatedInstrumentIds.includes(userInstrument.instrumentId.toString())) {
        bulkOptions.push(this.getRemovingOptionsForDashboardUserInstrument(dashboardObjectId, userInstrument));
        removedInstruments++;
      }
    }

    for (const instrumentId of updatedInstrumentIds) {
      const instrumentObjectId = new Types.ObjectId(instrumentId);
      if (!existingUserInstrumentsIds.includes(instrumentId)) {
        bulkOptions.push({
          updateOne: {
            filter: { userId, instrumentId: instrumentObjectId },
            update: { $addToSet: { dashboards: dashboardObjectId } as mongoose.mongo.BSON.Document },
            upsert: true,
          },
        });
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

  static async removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }) {
    const dashboardObjectId = new Types.ObjectId(dashboardId);

    const userInstrumentsForDashboard = await UserInstrument.find<IUserInstrument>({
      userId,
      dashboards: dashboardId,
    });

    const bulkOptions: mongodb.AnyBulkWriteOperation[] = [];

    for (const userInstrument of userInstrumentsForDashboard) {
      bulkOptions.push(this.getRemovingOptionsForDashboardUserInstrument(dashboardObjectId, userInstrument));
    }

    if (bulkOptions.length > 0) {
      await UserInstrument.bulkWrite(bulkOptions);
    }
  }

  static getRemovingOptionsForDashboardUserInstrument(
    dashboardObjectId: Types.ObjectId,
    userInstrument: IUserInstrument
  ): mongodb.AnyBulkWriteOperation {
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
}
