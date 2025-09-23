import { Router } from 'express';
import { requireAuth } from '@middleware';
import { DashboardController, InstrumentController, UserController, UserInstrumentController } from '@controllers';

const router = Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/profile', requireAuth, UserController.getProfile);

router.get('/dashboards', requireAuth, DashboardController.getDashboards);
router.post('/dashboards', requireAuth, DashboardController.createDashboard);
router.get('/dashboards/:dashboardId', requireAuth, DashboardController.getDashboardById);
router.patch('/dashboards/:dashboardId', requireAuth, DashboardController.updateDashboard);
router.delete('/dashboards/:dashboardId', requireAuth, DashboardController.deleteDashboard);

router.get('/instruments', requireAuth, InstrumentController.getInstruments);
router.get('/instruments/user', requireAuth, UserInstrumentController.getUserInstruments);
router.patch('/instruments/:instrumentId', requireAuth, UserInstrumentController.updateInstrumentState);

export default router;
