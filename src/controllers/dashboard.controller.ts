import { Request, Response } from 'express';
import { Dashboard, IDashboard, Instrument, ITab, UserInstrument } from '@models';
import { isTab, resolveDashboard } from '@utils';
import { removeUserInstrumentsForDashboard, updateUserInstrumentsForDashboard } from './user-instrument.controller';

// export const getDashboards = async (req: Request, res: Response) => {
//   //   const dashboards = await Dashboard.find({ ownerUserId: req.user._id }).populate('tabs.cards.items');
//   const dashboards = await Dashboard.find({ ownerUserId: req.user.id }).select(
//     'title icon'
//   );
//   res.json(dashboards || []);
// };

// export const createDashboard = async (req: Request, res: Response) => {
//   const { title, icon } = req.body;
//   if (!title || !icon)
//     return res.status(400).send("Missing or invalid 'title' or 'icon'");

//   const dashboard = await Dashboard.create({
//     ownerUserId: req.user.id,
//     title,
//     icon,
//     tabs: [],
//   });

//   res.status(201).json(dashboard);
// };

// export const getDashboardById = async (req: Request, res: Response) => {
//   const { dashboardId } = req.params;
//   const dashboard: IDashboard = await Dashboard.findOne({
//     _id: dashboardId,
//     ownerUserId: req.user.id,
//   });
//   if (!dashboard) return res.status(404).send("Dashboard not found");

//   const instrumentIds = dashboard.tabs.flatMap(t =>
//     t.cards.flatMap(c => c.items)
//   );

//   const instruments = await Instrument.find({
//     _id: { $in: instrumentIds },
//   }).lean();

//   const userInstruments = await UserInstrument.find({
//     ownerUserId: req.user.id,
//     dashboards: dashboardId,
//   }).lean();

//   res.json(resolveDashboard({
//     dashboard,
//     instruments,
//     userInstruments,
//   }));
// };

// export const updateDashboard = async (req: Request, res: Response) => {
//   const { tabs, title, icon } = req.body;

//   let dashboard = await Dashboard.findOne({ _id: req.params.dashboardId, ownerUserId: req.user.id });
//   if (!dashboard) return res.status(404).send("Dashboard not found");

//   if(tabs && !Array.isArray(tabs) || (tabs && !tabs.every((tab: unknown) => isTab(tab)))) {
//     return res.status(400).send("Invalid 'tabs' format");
//   }

//   if (tabs) dashboard.tabs = tabs;
//   if (title) dashboard.title = title;
//   if (icon) dashboard.icon = icon;

//   await dashboard.save();

//   if(!tabs) {
//     return res.status(200).json(dashboard);
//   }

//   const currentUserInstruments = tabs.flatMap((tab: ITab) => tab.cards.flatMap((card) => card.items))

//   await updateUserInstrumentsForDashboard({
//     userId: req.user.id,
//     dashboardId: dashboard._id,
//     currentUserInstruments
//   });

//   res.status(200).json(dashboard);
// };

// export const deleteDashboard = async (req: Request, res: Response) => {
//   const dashboard = await Dashboard.findOneAndDelete({
//     _id: req.params.dashboardId,
//     ownerUserId: req.user.id,
//   });

//   if (!dashboard) return res.status(404).send("Dashboard not found");

//   await removeUserInstrumentsForDashboard({
//     userId: req.user.id,
//     dashboardId: dashboard._id,
//   });

//   res.status(204).send();
// };

export class DashboardController {
  static getDashboards = async (req: Request, res: Response) => {
    const dashboards = await Dashboard.find({ ownerUserId: req.user.id }).select('title icon');
    res.json(dashboards || []);
  };
  
  static createDashboard = async (req: Request, res: Response) => {
    const { title, icon } = req.body;
    if (!title || !icon) return res.status(400).send("Missing or invalid 'title' or 'icon'");
  
    const dashboard = await Dashboard.create({
      ownerUserId: req.user.id,
      title,
      icon,
      tabs: [],
    });
  
    res.status(201).json(dashboard);
  };
  
  static getDashboardById = async (req: Request, res: Response) => {
    const { dashboardId } = req.params;
    const dashboard: IDashboard = await Dashboard.findOne({
      _id: dashboardId,
      ownerUserId: req.user.id,
    });
    if (!dashboard) return res.status(404).send("Dashboard not found");
  
    const instrumentIds = dashboard.tabs.flatMap(t => t.cards.flatMap(c => c.items));
  
    const instruments = await Instrument.find({
      _id: { $in: instrumentIds },
    }).lean();
  
    const userInstruments = await UserInstrument.find({
      ownerUserId: req.user.id,
      dashboards: dashboardId,
    }).lean();
  
    res.json(resolveDashboard({
      dashboard,
      instruments,
      userInstruments,
    }));
  };
  
  static updateDashboard = async (req: Request, res: Response) => {
    const { tabs, title, icon } = req.body;
  
    let dashboard = await Dashboard.findOne({ _id: req.params.dashboardId, ownerUserId: req.user.id });
    if (!dashboard) return res.status(404).send("Dashboard not found");
  
    if (tabs && !Array.isArray(tabs) || (tabs && !tabs.every((tab: unknown) => isTab(tab)))) {
      return res.status(400).send("Invalid 'tabs' format");
    }
  
    if (tabs) dashboard.tabs = tabs;
    if (title) dashboard.title = title;
    if (icon) dashboard.icon = icon;
  
    await dashboard.save();
  
    if(!tabs) return res.status(200).json(dashboard);
  
    const currentUserInstruments = tabs.flatMap((tab: ITab) => tab.cards.flatMap((card) => card.items));
  
    await updateUserInstrumentsForDashboard({
      userId: req.user.id,
      dashboardId: dashboard._id,
      currentUserInstruments
    });
  
    res.status(200).json(dashboard);
  };
  
  static deleteDashboard = async (req: Request, res: Response) => {
    const dashboard = await Dashboard.findOneAndDelete({
      _id: req.params.dashboardId,
      ownerUserId: req.user.id,
    });
  
    if (!dashboard) return res.status(404).send("Dashboard not found");
  
    await removeUserInstrumentsForDashboard({
      userId: req.user.id,
      dashboardId: dashboard._id,
    });
  
    res.status(204).send();
  };
}
