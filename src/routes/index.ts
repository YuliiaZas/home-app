import { Router } from 'express';
import { requireAuth } from '@middleware';
import { DashboardController, InstrumentController, UserController, UserInstrumentController } from '@controllers';

const router = Router();

const userController = new UserController();
const dashboardController = new DashboardController();
const instrumentController = new InstrumentController();
const userInstrumentController = new UserInstrumentController();

router.post('/user/register', userController.registerUser.bind(userController));
router.post('/user/login', userController.loginUser.bind(userController));
router.get('/user/profile', requireAuth, userController.getProfile.bind(userController));

router.post('/dashboards', requireAuth, dashboardController.createDashboard.bind(dashboardController));
router.post('/dashboards/default', requireAuth, dashboardController.createDefaultDashboards.bind(dashboardController));
router.get('/dashboards', requireAuth, dashboardController.getDashboards.bind(dashboardController));
router.get('/dashboards/:aliasId', requireAuth, dashboardController.getDashboardByAliasId.bind(dashboardController));
router.patch('/dashboards/:aliasId', requireAuth, dashboardController.updateDashboard.bind(dashboardController));
router.delete('/dashboards/:aliasId', requireAuth, dashboardController.deleteDashboard.bind(dashboardController));

router.get('/instruments', requireAuth, instrumentController.getInstruments.bind(instrumentController));

router.get('/instruments/user', requireAuth, userInstrumentController.getUserInstruments.bind(userInstrumentController));
router.patch('/instruments/user/:instrumentId', requireAuth, userInstrumentController.updateInstrumentState.bind(userInstrumentController));

export default router;
