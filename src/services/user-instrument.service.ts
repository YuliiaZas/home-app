import { ClientSession } from 'mongoose';
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
    const existingUserInstruments: IUserInstrument[] = await UserInstrument.find({
      userId,
      dashboards: dashboardId,
    }).session(session);

    const existingUserInstrumentsIds = existingUserInstruments.map((ui) => ui.instrumentId.toString());

    const instrumentsToRemoveForDashboard = existingUserInstruments.filter(
      (existingUserInstrument) => !updatedInstrumentIds.includes(existingUserInstrument.instrumentId.toString())
    );

    for (const userInstrument of instrumentsToRemoveForDashboard) {
      userInstrument.dashboards = userInstrument.dashboards.filter((dId) => dId.toString() !== dashboardId.toString());
      if (userInstrument.dashboards.length === 0) {
        await UserInstrument.deleteOne({ _id: userInstrument._id }, { session });
      } else {
        await userInstrument.save({ session });
      }
    }

    const instrumentIdsToAdd = updatedInstrumentIds.filter(
      (instrumentId) => !existingUserInstrumentsIds.includes(instrumentId)
    );
    let addedInstruments = 0;

    for (const instrumentId of instrumentIdsToAdd) {
      const existing = await UserInstrument.findOne({
        userId,
        instrumentId,
      }).session(session);

      if (existing) {
        if (!existing.dashboards.some((dId) => dId.toString() === dashboardId)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          existing.dashboards.push(dashboardId as any);
          await existing.save({ session });
          addedInstruments++;
        }
      } else {
        const newUserInstrument = new UserInstrument({
          userId,
          instrumentId,
          dashboards: [dashboardId],
        });
        await newUserInstrument.save({ session });
        addedInstruments++;
      }
    }

    return {
      dashboardId,
      addedInstruments,
      removedInstruments: instrumentsToRemoveForDashboard.length,
    };
  }

  static async removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }) {
    const userInstrumentsForDashboard = await UserInstrument.find<IUserInstrument>({
      userId,
      dashboards: dashboardId,
    });

    await Promise.all(
      userInstrumentsForDashboard.map(async (userInstrument) => {
        userInstrument.dashboards = userInstrument.dashboards.filter((dId) => dId.toString() !== dashboardId);
        if (userInstrument.dashboards.length === 0) {
          await UserInstrument.deleteOne({ _id: userInstrument._id });
        } else {
          await userInstrument.save();
        }
      })
    );
  }
}
