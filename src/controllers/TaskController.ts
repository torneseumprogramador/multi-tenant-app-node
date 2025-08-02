import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { TaskService, CreateTaskData, UpdateTaskData } from '../services/TaskService';
import { TaskStatus, TaskPriority } from '@prisma/client';
import moment from 'moment';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // Validações para criação de tarefa
  static createValidation = [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Título deve ter entre 1 e 100 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Data de vencimento deve ser uma data válida'),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status deve ser PENDING, IN_PROGRESS ou COMPLETED')
  ];

  // Validações para atualização de tarefa
  static updateValidation = [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Título deve ter entre 1 e 100 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Descrição deve ter no máximo 500 caracteres'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Data de vencimento deve ser uma data válida'),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Status deve ser PENDING, IN_PROGRESS ou COMPLETED')
  ];

  // Listar todas as tarefas
  async index(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as TaskStatus;
      const tasks = await this.taskService.getAllTasks(req.tenant.id, status);
      
      res.render('tasks/index', {
        tasks,
        currentStatus: status,
        moment,
        tenant: req.tenant
      });
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Mostrar formulário de criação
  async create(req: Request, res: Response): Promise<void> {
    res.render('tasks/create');
  }

  // Criar nova tarefa
  async store(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('tasks/create', {
        errors: errors.array(),
        oldData: req.body
      });
    }

    try {
      const taskData: CreateTaskData = {
        title: req.body.title,
        description: req.body.description || undefined,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        status: req.body.status as TaskStatus,
        priority: req.body.priority as TaskPriority,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      await this.taskService.createTask(taskData, req.tenant.id, req.currentUser.id);
      
      (req as any).flash?.('success', 'Tarefa criada com sucesso!');
      res.redirect('/tasks');
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.render('tasks/create', {
        errors: [{ msg: 'Erro ao criar tarefa' }],
        oldData: req.body
      });
    }
  }

  // Mostrar formulário de edição
  async edit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const task = await this.taskService.getTaskById(id, req.tenant.id);
      
      if (!task) {
        return res.status(404).render('error', {
          message: 'Tarefa não encontrada'
        });
      }

      res.render('tasks/edit', { task, moment });
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar tarefa
  async update(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const task = await this.taskService.getTaskById(parseInt(req.params.id), req.tenant.id);
      return res.render('tasks/edit', {
        task,
        errors: errors.array(),
        moment
      });
    }

    try {
      const id = parseInt(req.params.id);
      const taskData: UpdateTaskData = {
        title: req.body.title,
        description: req.body.description || undefined,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        status: req.body.status as TaskStatus,
        priority: req.body.priority as TaskPriority,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      const updatedTask = await this.taskService.updateTask(id, req.tenant.id, taskData);
      
      if (!updatedTask) {
        return res.status(404).render('error', {
          message: 'Tarefa não encontrada'
        });
      }

      (req as any).flash?.('success', 'Tarefa atualizada com sucesso!');
      res.redirect('/tasks');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.render('tasks/edit', {
        task: { id: parseInt(req.params.id), ...req.body },
        errors: [{ msg: 'Erro ao atualizar tarefa' }],
        moment
      });
    }
  }

  // Excluir tarefa
  async destroy(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deletedTask = await this.taskService.deleteTask(id, req.tenant.id);
      
      if (!deletedTask) {
        return res.status(404).render('error', {
          message: 'Tarefa não encontrada'
        });
      }

      (req as any).flash?.('success', 'Tarefa excluída com sucesso!');
      res.redirect('/tasks');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      (req as any).flash?.('error', 'Erro ao excluir tarefa');
      res.redirect('/tasks');
    }
  }

  // Atualizar status da tarefa
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const status = req.body.status as TaskStatus;
      
      const updatedTask = await this.taskService.updateTaskStatus(id, req.tenant.id, status);
      
      if (!updatedTask) {
        res.status(404).json({ error: 'Tarefa não encontrada' });
        return;
      }

      res.json({ success: true, task: updatedTask });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 