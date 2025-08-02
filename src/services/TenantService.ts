import { PrismaClient, Tenant, TenantConfig, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTenantData {
  name: string;
  slug: string;
  domain?: string;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    allowRegistration?: boolean;
    maxTasksPerUser?: number;
    allowTaskComments?: boolean;
  };
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  domain?: string;
  isActive?: boolean;
  config?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    allowRegistration?: boolean;
    maxTasksPerUser?: number;
    allowTaskComments?: boolean;
  };
}

export class TenantService {
  async getAllTenants(): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      include: {
        config: true,
        _count: {
          select: {
            users: true,
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({
      where: { id },
      include: {
        config: true,
        users: {
          include: {
            _count: {
              select: {
                tasks: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true,
            tasks: true
          }
        }
      }
    });
  }

  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({
      where: { slug },
      include: {
        config: true
      }
    });
  }

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    return await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        domain: data.domain,
        config: {
          create: {
            primaryColor: data.config?.primaryColor || '#6366f1',
            secondaryColor: data.config?.secondaryColor || '#8b5cf6',
            logoUrl: data.config?.logoUrl,
            companyName: data.config?.companyName,
            companyEmail: data.config?.companyEmail,
            companyPhone: data.config?.companyPhone,
            companyAddress: data.config?.companyAddress,
            allowRegistration: data.config?.allowRegistration ?? true,
            maxTasksPerUser: data.config?.maxTasksPerUser || 100,
            allowTaskComments: data.config?.allowTaskComments ?? true
          }
        }
      },
      include: {
        config: true
      }
    });
  }

  async updateTenant(id: string, data: UpdateTenantData): Promise<Tenant | null> {
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      isActive: data.isActive
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    return await prisma.tenant.update({
      where: { id },
      data: {
        ...updateData,
        config: data.config ? {
          upsert: {
            create: {
              primaryColor: data.config.primaryColor || '#6366f1',
              secondaryColor: data.config.secondaryColor || '#8b5cf6',
              logoUrl: data.config.logoUrl,
              companyName: data.config.companyName,
              companyEmail: data.config.companyEmail,
              companyPhone: data.config.companyPhone,
              companyAddress: data.config.companyAddress,
              allowRegistration: data.config.allowRegistration ?? true,
              maxTasksPerUser: data.config.maxTasksPerUser || 100,
              allowTaskComments: data.config.allowTaskComments ?? true
            },
            update: {
              primaryColor: data.config.primaryColor,
              secondaryColor: data.config.secondaryColor,
              logoUrl: data.config.logoUrl,
              companyName: data.config.companyName,
              companyEmail: data.config.companyEmail,
              companyPhone: data.config.companyPhone,
              companyAddress: data.config.companyAddress,
              allowRegistration: data.config.allowRegistration,
              maxTasksPerUser: data.config.maxTasksPerUser,
              allowTaskComments: data.config.allowTaskComments
            }
          }
        } : undefined
      },
      include: {
        config: true
      }
    });
  }

  async deleteTenant(id: string): Promise<Tenant | null> {
    return await prisma.tenant.delete({
      where: { id },
      include: {
        config: true
      }
    });
  }

  async getTenantStats(id: string) {
    const [users, tasks, completedTasks, pendingTasks] = await Promise.all([
      prisma.user.count({ where: { tenantId: id } }),
      prisma.task.count({ where: { tenantId: id } }),
      prisma.task.count({ where: { tenantId: id, status: 'COMPLETED' } }),
      prisma.task.count({ where: { tenantId: id, status: 'PENDING' } })
    ]);

    return {
      users,
      tasks,
      completedTasks,
      pendingTasks,
      completionRate: tasks > 0 ? (completedTasks / tasks) * 100 : 0
    };
  }

  async createDefaultUser(tenantId: string): Promise<User> {
    return await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123', // Em produção, usar hash
        role: UserRole.ADMIN,
        tenantId
      }
    });
  }
} 