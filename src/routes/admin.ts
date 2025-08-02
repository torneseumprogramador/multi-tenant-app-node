import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { TenantMiddleware } from '../middleware/tenant';

const router = Router();
const adminController = new AdminController();

// Middleware para adicionar flash messages
declare global {
  namespace Express {
    interface Request {
      flash?: (type: string, message: string) => void;
    }
  }
}

// Adicionar flash messages simples
router.use((req, res, next) => {
  req.flash = (type: string, message: string) => {
    if (!(req as any).session) (req as any).session = {};
    if (!(req as any).session.flash) (req as any).session.flash = {};
    (req as any).session.flash[type] = message;
  };
  next();
});

// Middleware de autenticação para admin
router.use(TenantMiddleware.requireRole(['SUPER_ADMIN', 'ADMIN']));

// Dashboard
router.get('/', adminController.dashboard.bind(adminController));

// Rotas para tenants
router.get('/tenants', adminController.index.bind(adminController));
router.get('/tenants/create', adminController.create.bind(adminController));
router.post('/tenants', AdminController.createTenantValidation, adminController.store.bind(adminController));
router.get('/tenants/:id', adminController.show.bind(adminController));
router.get('/tenants/:id/edit', adminController.edit.bind(adminController));
router.put('/tenants/:id', AdminController.updateTenantValidation, adminController.update.bind(adminController));
router.delete('/tenants/:id', adminController.destroy.bind(adminController));

export default router; 