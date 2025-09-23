// export function initUserInstrumentsForDashboard({ tabs, userId, dashboardId, instruments, userInstruments }:
//   {
//     tabs: ITab[];
//     userId: string;
//     dashboardId: string;
//     instruments: IInstrument[];
//     userInstruments: IUserInstrument[];
//   }
// ) {
//   const actualInstrumentIdsInTabs = new Set();
//   (tabs || []).forEach((tab) =>
//     (tab.cards || []).forEach((card) =>
//       (card.items || []).forEach((item) => actualInstrumentIdsInTabs.add(item.instrumentId))
//     )
//   );

//   const userInstrumentsDb = userInstruments.find((u) => u.userId === userId) || { userId, instruments: [] };

//   const updatedInstruments = userInstrumentsDb.instruments
//     .map((instrument) =>
//       instrument.dashboards.includes(dashboardId) && !actualInstrumentIdsInTabs.has(instrument.instrumentId)
//         ? null // remove instrument that is no longer in dashboard
//         : instrument
//     )
//     .filter(Boolean);

//   actualInstrumentIdsInTabs.forEach((instrumentId) => {
//     let userInstrumentIndex = updatedInstruments.findIndex((d) => d.instrumentId === instrumentId);

//     if (userInstrumentIndex < 0) {
//       // Add new instrument
//       const globalInstrument = instruments.find((d) => d.id === instrumentId);

//       if (globalInstrument) {
//         const userInstrument = {
//           instrumentId,
//           dashboards: [dashboardId],
//           ...(globalInstrument.type === "instrument" ? { state: globalInstrument.state ?? false } : {}),
//           ...(globalInstrument.type === "sensor" ? { value: globalInstrument.value } : {}),
//         };

//         updatedInstruments.push(userInstrument);
//       }
//     } else {
//       const currentUserInstrument = updatedInstruments[userInstrumentIndex];

//       if (!currentUserInstrument.dashboards.includes(dashboardId)) {
//         // Add dashboardId to existing instrument
//         const userInstrument = {
//           ...updatedInstruments[userInstrumentIndex],
//           dashboards: [...updatedInstruments[userInstrumentIndex].dashboards, dashboardId]
//         };

//         updatedInstruments[userInstrumentIndex] = userInstrument;
//       }
//     }
//   });

//   const updatedUserInstrumentsDb = userInstruments.map((u) =>
//     u.userId === userId ? { ...u, instruments: updatedInstruments } : u
//   );

//   if (!userInstruments.some((u) => u.userId === userId)) {
//     updatedUserInstrumentsDb.push({ userId, instruments: updatedInstruments });
//   }

//   return updatedUserInstrumentsDb;
// }

// export function removeUserInstrumentsForDashboard(userInstruments: IUserInstrument[], userId: string, dashboardId: string) {
//   return userInstruments.map((ud) =>
//     ud.userId === userId
//       ? {
//           ...ud,
//           instruments: ud.instruments
//             .map((instrument) => ({
//               ...instrument,
//               dashboards: instrument.dashboards.filter((dId) => dId !== dashboardId),
//             }))
//             .filter((instrument) => instrument.dashboards.length > 0),
//         }
//       : ud
//   );
// }
