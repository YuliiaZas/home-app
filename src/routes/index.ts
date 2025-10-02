import { Router } from 'express';
import { requireAuth } from '@middleware';
import { DashboardController, InstrumentController, UserController, UserInstrumentController } from '@controllers';

const router = Router();
const userController = new UserController();
const dashboardController = new DashboardController();
const instrumentController = new InstrumentController();
const userInstrumentController = new UserInstrumentController();

router.post('/user/register', userController.registerUser);
router.post('/user/login', userController.loginUser);
router.get('/user/profile', requireAuth, userController.getProfile);

router.post('/dashboards', requireAuth, dashboardController.createDashboard);
router.post('/dashboards/default', requireAuth, dashboardController.createDefaultDashboards);
router.get('/dashboards', requireAuth, dashboardController.getDashboards);
router.get('/dashboards/:aliasId', requireAuth, dashboardController.getDashboardByAliasId);
router.patch('/dashboards/:aliasId', requireAuth, dashboardController.updateDashboard);
router.delete('/dashboards/:aliasId', requireAuth, dashboardController.deleteDashboard);

router.get('/instruments', requireAuth, instrumentController.getInstruments);
router.get('/instruments/user', requireAuth, userInstrumentController.getUserInstruments);
router.patch('/instruments/:instrumentId', requireAuth, userInstrumentController.updateInstrumentState);

export default router;
