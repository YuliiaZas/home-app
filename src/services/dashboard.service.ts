import { Dashboard, DashboardTemplate, IDashboard, IDashboardTemplate, ITab } from '@models';
import { AppError } from '@utils';
import { UserInstrumentService } from './user-instrument.service';
import { InstrumentService } from './instrument.service';

export class DashboardService {
  static async addDefaultDashboards(userId: string): Promise<IDashboard[]> {
    const templates = await DashboardTemplate.find<IDashboardTemplate>().lean();
    if (!templates || templates.length === 0) throw new AppError('No dashboard templates found', 500);

    const allTabs = templates.flatMap((tpl) => tpl.tabs);
    const validationError = await InstrumentService.validateInstrumentsInTabs(allTabs);
    if (validationError) {
      throw new AppError(`Default dashboards not created due to invalid instrument IDs: ${validationError.invalidIds?.join(', ')}`, 400);
    }

    const dashboards = await Promise.all(
      templates.map((tpl) =>
        Dashboard.create({
          ownerUserId: userId,
          title: tpl.title,
          icon: tpl.icon,
          tabs: tpl.tabs,
        })
      )
    );

    dashboards.forEach(
      async (d) =>
        await UserInstrumentService.updateUserInstrumentsForDashboard({
          userId,
          dashboardId: d._id,
          currentUserInstruments: InstrumentService.getInstrumentsFromTabs(d.tabs) || [],
        })
    );

    return dashboards;
  }
}
