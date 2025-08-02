import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      tenant?: any;
      currentUser?: any;
    }
  }
}

export class TenantMiddleware {
  static async resolveTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const host = req.get('host') || '';
      const domain = host.split(':')[0]; // Remove porta se houver
      
      // Buscar tenant por domínio
      let tenant = await prisma.tenant.findFirst({
        where: {
          domain: domain,
          isActive: true
        },
        include: {
          config: true
        }
      });

      // Se não encontrar por domínio, tentar por slug no path
      if (!tenant) {
        const pathParts = req.path.split('/');
        const potentialSlug = pathParts[1]; // /slug/...
        
        if (potentialSlug && potentialSlug !== 'admin') {
          tenant = await prisma.tenant.findFirst({
            where: {
              slug: potentialSlug,
              isActive: true
            },
            include: {
              config: true
            }
          });
        }
      }

      // Se ainda não encontrar, usar tenant padrão (para desenvolvimento)
      if (!tenant) {
        tenant = await prisma.tenant.findFirst({
          where: {
            slug: 'default',
            isActive: true
          },
          include: {
            config: true
          }
        });
      }

      if (!tenant) {
        return res.status(404).render('error', {
          message: 'Organização não encontrada'
        });
      }

      req.tenant = tenant;
      next();
    } catch (error) {
      console.error('Erro ao resolver tenant:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  static async requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
      // Aqui você implementaria a lógica de autenticação
      // Por enquanto, vamos simular um usuário padrão
      const user = await prisma.user.findFirst({
        where: {
          tenantId: req.tenant.id,
          isActive: true
        }
      });

      if (!user) {
        return res.redirect('/auth/login');
      }

      req.currentUser = user;
      next();
    } catch (error) {
      console.error('Erro na autenticação:', error);
      res.status(500).render('error', {
        message: 'Erro interno do servidor'
      });
    }
  }

  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.currentUser) {
        return res.redirect('/auth/login');
      }

      if (!roles.includes(req.currentUser.role)) {
        return res.status(403).render('error', {
          message: 'Acesso negado'
        });
      }

      next();
    };
  }
} 