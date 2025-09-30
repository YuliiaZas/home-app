import { Router } from 'express';
import { requireAuth } from '@middleware';
import { DashboardController, InstrumentController, UserController, UserInstrumentController } from '@controllers';

const router = Router();

router.post('/user/register', UserController.registerUser);
router.post('/user/login', UserController.loginUser);
router.get('/user/profile', requireAuth, UserController.getProfile);

router.post('/dashboards', requireAuth, DashboardController.createDashboard);
router.post('/dashboards/default', requireAuth, DashboardController.createDefaultDashboards);
router.get('/dashboards', requireAuth, DashboardController.getDashboards);
router.get('/dashboards/:aliasId', requireAuth, DashboardController.getDashboardByAliasId);
router.patch('/dashboards/:aliasId', requireAuth, DashboardController.updateDashboard);
router.delete('/dashboards/:aliasId', requireAuth, DashboardController.deleteDashboard);

router.get('/instruments', requireAuth, InstrumentController.getInstruments);
router.get('/instruments/user', requireAuth, UserInstrumentController.getUserInstruments);
router.patch('/instruments/:instrumentId', requireAuth, UserInstrumentController.updateInstrumentState);

export default router;
