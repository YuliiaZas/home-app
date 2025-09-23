import { Router } from "express";
import { requireAuth } from "@middleware";
import { DashboardController } from "@controllers";
// import * as DashboardController from "@controllers";

const router = Router();

router.get("/dashboards", requireAuth, DashboardController.getDashboards);
router.post("/dashboards", requireAuth, DashboardController.createDashboard);
router.get("/dashboards/:dashboardId", requireAuth, DashboardController.getDashboardById);
router.patch("/dashboards/:dashboardId", requireAuth, DashboardController.updateDashboard);
router.delete("/dashboards/:dashboardId", requireAuth, DashboardController.deleteDashboard);

export default router;

// export default function setRoutes(app: any) {
//   const IndexController = require('../controllers/index').default;
//   const indexController = new IndexController();

//   app.get('/', indexController.getHome);
//   app.post('/home', indexController.postHome);
// }
