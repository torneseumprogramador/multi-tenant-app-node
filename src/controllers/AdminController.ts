import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { TenantService, CreateTenantData, UpdateTenantData } from '../services/TenantService';

export class AdminController {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  // Validações para criação de tenant
  static createTenantValidation = [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('slug')
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
    body('domain')
      .optional()
      .isFQDN()
      .withMessage('Domínio deve ser válido'),
    body('config.primaryColor')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor primária deve ser um código hexadecimal válido'),
    body('config.secondaryColor')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor secundária deve ser um código hexadecimal válido'),
    body('config.maxTasksPerUser')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Máximo de tarefas deve ser entre 1 e 1000')
  ];

  // Validações para atualização de tenant
  static updateTenantValidation = [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('slug')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
    body('domain')
      .optional()
      .isFQDN()
      .withMessage('Domínio deve ser válido'),
    body('config.primaryColor')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor primária deve ser um código hexadecimal válido'),
    body('config.secondaryColor')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Cor secundária deve ser um código hexadecimal válido'),
    body('config.maxTasksPerUser')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Máximo de tarefas deve ser entre 1 e 1000')
  ];

  // Dashboard principal
  async dashboard(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await this.tenantService.getAllTenants();
      
      res.render('admin/dashboard', {
        tenants,
        stats: {
          totalTenants: tenants.length,
          activeTenants: tenants.filter(t => t.isActive).length,
          totalUsers: tenants.reduce((sum, t) => sum + ((t as any)._count?.users || 0), 0),
          totalTasks: tenants.reduce((sum, t) => sum + ((t as any)._count?.tasks || 0), 0)
        }
      });
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar todos os tenants
  async index(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await this.tenantService.getAllTenants();
      
      res.render('admin/tenants/index', {
        tenants
      });
    } catch (error) {
      console.error('Erro ao listar tenants:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Mostrar formulário de criação
  async create(req: Request, res: Response): Promise<void> {
    res.render('admin/tenants/create');
  }

  // Criar novo tenant
  async store(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('admin/tenants/create', {
        errors: errors.array(),
        oldData: req.body
      });
    }

    try {
      const tenantData: CreateTenantData = {
        name: req.body.name,
        slug: req.body.slug,
        domain: req.body.domain || undefined,
        config: {
          primaryColor: req.body.config?.primaryColor,
          secondaryColor: req.body.config?.secondaryColor,
          logoUrl: req.body.config?.logoUrl,
          companyName: req.body.config?.companyName,
          companyEmail: req.body.config?.companyEmail,
          companyPhone: req.body.config?.companyPhone,
          companyAddress: req.body.config?.companyAddress,
          allowRegistration: req.body.config?.allowRegistration === 'true',
          maxTasksPerUser: req.body.config?.maxTasksPerUser ? parseInt(req.body.config.maxTasksPerUser) : undefined,
          allowTaskComments: req.body.config?.allowTaskComments === 'true'
        }
      };

      const tenant = await this.tenantService.createTenant(tenantData);
      
      // Criar usuário padrão para o tenant
      await this.tenantService.createDefaultUser(tenant.id);

      (req as any).flash?.('success', 'Organização criada com sucesso!');
      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      res.render('admin/tenants/create', {
        errors: [{ msg: 'Erro ao criar organização' }],
        oldData: req.body
      });
    }
  }

  // Mostrar detalhes do tenant
  async show(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const tenant = await this.tenantService.getTenantById(id);
      
      if (!tenant) {
        return res.status(404).render('error', {
          message: 'Organização não encontrada'
        });
      }

      const stats = await this.tenantService.getTenantStats(id);

      res.render('admin/tenants/show', { 
        tenant,
        stats
      });
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Mostrar formulário de edição
  async edit(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const tenant = await this.tenantService.getTenantById(id);
      
      if (!tenant) {
        return res.status(404).render('error', {
          message: 'Organização não encontrada'
        });
      }

      res.render('admin/tenants/edit', { tenant });
    } catch (error) {
      console.error('Erro ao buscar tenant:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar tenant
  async update(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const tenant = await this.tenantService.getTenantById(req.params.id);
      return res.render('admin/tenants/edit', {
        tenant,
        errors: errors.array()
      });
    }

    try {
      const id = req.params.id;
      const tenantData: UpdateTenantData = {
        name: req.body.name,
        slug: req.body.slug,
        domain: req.body.domain || undefined,
        isActive: req.body.isActive === 'true',
        config: {
          primaryColor: req.body.config?.primaryColor,
          secondaryColor: req.body.config?.secondaryColor,
          logoUrl: req.body.config?.logoUrl,
          companyName: req.body.config?.companyName,
          companyEmail: req.body.config?.companyEmail,
          companyPhone: req.body.config?.companyPhone,
          companyAddress: req.body.config?.companyAddress,
          allowRegistration: req.body.config?.allowRegistration === 'true',
          maxTasksPerUser: req.body.config?.maxTasksPerUser ? parseInt(req.body.config.maxTasksPerUser) : undefined,
          allowTaskComments: req.body.config?.allowTaskComments === 'true'
        }
      };

      const updatedTenant = await this.tenantService.updateTenant(id, tenantData);
      
      if (!updatedTenant) {
        return res.status(404).render('error', {
          message: 'Organização não encontrada'
        });
      }

      (req as any).flash?.('success', 'Organização atualizada com sucesso!');
      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      res.render('admin/tenants/edit', {
        tenant: { id: req.params.id, ...req.body },
        errors: [{ msg: 'Erro ao atualizar organização' }]
      });
    }
  }

  // Excluir tenant
  async destroy(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const deletedTenant = await this.tenantService.deleteTenant(id);
      
      if (!deletedTenant) {
        return res.status(404).render('error', {
          message: 'Organização não encontrada'
        });
      }

      (req as any).flash?.('success', 'Organização excluída com sucesso!');
      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Erro ao excluir tenant:', error);
      (req as any).flash?.('error', 'Erro ao excluir organização');
      res.redirect('/admin/tenants');
    }
  }
} 