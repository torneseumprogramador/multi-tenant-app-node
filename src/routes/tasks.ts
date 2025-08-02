import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

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

// Rotas para tarefas
router.get('/', taskController.index.bind(taskController));
router.get('/create', taskController.create.bind(taskController));
router.post('/', TaskController.createValidation, taskController.store.bind(taskController));
router.get('/:id/edit', taskController.edit.bind(taskController));
router.put('/:id', TaskController.updateValidation, taskController.update.bind(taskController));
router.delete('/:id', taskController.destroy.bind(taskController));

// Rota para atualizar status via AJAX
router.patch('/:id/status', taskController.updateStatus.bind(taskController));

export default router; 