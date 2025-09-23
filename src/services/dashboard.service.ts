import { Dashboard, DashboardTemplate, IDashboardTemplate, ITab } from '@models';
import { UserInstrumentService } from './user-instrument.service';

export class DashboardService {
  static async addDefaultDashboards(userId: string) {
    const templates: IDashboardTemplate[] = await DashboardTemplate.find().lean();
    if (!templates || templates.length === 0) return;

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
          currentUserInstruments: this.getInstrumentsFromTabs(d.tabs) || [],
        })
    );
  }

  static getInstrumentsFromTabs(tabs: ITab[]): string[] {
    return tabs.flatMap((t) => t.cards.flatMap((c) => c.items));
  }
}
