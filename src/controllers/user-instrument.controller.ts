import { Instrument, IUserInstrument, UserInstrument } from "@models";

export const updateUserInstrumentsForDashboard = async (
  {userId, dashboardId, currentUserInstruments}: {
    userId: string,
    dashboardId: string,
    currentUserInstruments: string[]
  }
): Promise<void> => {
  const userInstrumentsForDashboard: IUserInstrument[] = await UserInstrument.find({
    userId,
    dashboards: dashboardId,
  });

  const instrumentsNeededToBeRemoved = userInstrumentsForDashboard.filter((userInstrument) => !currentUserInstruments.includes(userInstrument.instrumentId));

  instrumentsNeededToBeRemoved.forEach(async (userInstrument) => {
    userInstrument.dashboards = userInstrument.dashboards.filter(dId => dId !== dashboardId);
    if (userInstrument.dashboards.length === 0) {
      await UserInstrument.deleteOne({ _id: userInstrument._id });
    } else {
      await userInstrument.save();
    }
  });

  const instrumentsNeededToBeAdded = currentUserInstruments.filter((id) => !userInstrumentsForDashboard.some((userInstrument) => userInstrument.instrumentId === id));

  instrumentsNeededToBeAdded.forEach(async (instrumentId) => {
    const globalInstrument = await Instrument.findOne({ id: instrumentId }).lean();
    if (globalInstrument) {
      const newUserInstrument = new UserInstrument({
        userId,
        instrumentId,
        dashboards: [dashboardId],
        ...(globalInstrument.type === "device" ? { state: globalInstrument.state ?? false } : {}),
        ...(globalInstrument.type === "sensor" ? { value: globalInstrument.value } : {}),
      });
      await newUserInstrument.save();
    }
  });
};

export const removeUserInstrumentsForDashboard =async({userId, dashboardId}: {
  userId: string,
  dashboardId: string,
}) =>{
  const userInstrumentsForDashboard: IUserInstrument[] = await UserInstrument.find({
    userId,
    dashboards: dashboardId,
  });

  userInstrumentsForDashboard.forEach(async (userInstrument) => {
    userInstrument.dashboards = userInstrument.dashboards.filter(dId => dId !== dashboardId);
    if (userInstrument.dashboards.length === 0) {
      await UserInstrument.deleteOne({ _id: userInstrument._id });
    } else {
      await userInstrument.save();
    }
  });
}