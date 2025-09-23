import { Instrument, IUserInstrument, UserInstrument } from '@models';

export class UserInstrumentService {
  static async updateUserInstrumentsForDashboard({
    userId,
    dashboardId,
    currentUserInstruments,
  }: {
    userId: string;
    dashboardId: string;
    currentUserInstruments: string[];
  }) {
    const userInstrumentsForDashboard: IUserInstrument[] = await UserInstrument.find({
      userId,
      dashboards: dashboardId,
    });

    const instrumentsToRemove = userInstrumentsForDashboard.filter(
      (userInstrument) => !currentUserInstruments.includes(userInstrument.instrumentId.toString())
    );

    for (const userInstrument of instrumentsToRemove) {
      userInstrument.dashboards = userInstrument.dashboards.filter((dId) => dId.toString() !== dashboardId.toString());
      if (userInstrument.dashboards.length === 0) {
        await UserInstrument.deleteOne({ _id: userInstrument._id });
      } else {
        await userInstrument.save();
      }
    }

    const instrumentIdsToAdd = currentUserInstruments.filter(
      (id) => !userInstrumentsForDashboard.some((userInstrument) => userInstrument.instrumentId.toString() === id)
    );

    for (const instrumentId of instrumentIdsToAdd) {
      const globalInstrument = await Instrument.findOne({
        id: instrumentId,
      }).lean();

      if (globalInstrument) {
        const newUserInstrument = new UserInstrument({
          userId,
          instrumentId,
          dashboards: [dashboardId],
          ...(globalInstrument.type === 'device' ? { state: globalInstrument.state ?? false } : {}),
          ...(globalInstrument.type === 'sensor' ? { value: globalInstrument.value } : {}),
        });
        await newUserInstrument.save();
      }
    }
  }

  static async removeUserInstrumentsForDashboard({ userId, dashboardId }: { userId: string; dashboardId: string }) {
    const userInstrumentsForDashboard: IUserInstrument[] = await UserInstrument.find({
      userId,
      dashboards: dashboardId,
    });

    userInstrumentsForDashboard.forEach(async (userInstrument) => {
      userInstrument.dashboards = userInstrument.dashboards.filter((dId) => dId !== dashboardId);
      if (userInstrument.dashboards.length === 0) {
        await UserInstrument.deleteOne({ _id: userInstrument._id });
      } else {
        await userInstrument.save();
      }
    });
  }
}
