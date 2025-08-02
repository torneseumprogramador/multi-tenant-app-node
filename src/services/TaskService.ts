import { PrismaClient, Task, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
}

export class TaskService {
  async getAllTasks(tenantId: string, status?: TaskStatus): Promise<Task[]> {
    const where: any = { tenantId };
    if (status) where.status = status;
    
    return await prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getTaskById(id: number, tenantId: string): Promise<Task | null> {
    return await prisma.task.findUnique({
      where: { 
        id,
        tenantId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  async createTask(data: CreateTaskData, tenantId: string, userId: string): Promise<Task> {
    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        status: data.status || TaskStatus.PENDING,
        priority: data.priority || TaskPriority.MEDIUM,
        tags: data.tags || [],
        tenantId,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  async updateTask(id: number, tenantId: string, data: UpdateTaskData): Promise<Task | null> {
    return await prisma.task.update({
      where: { 
        id,
        tenantId
      },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  async deleteTask(id: number, tenantId: string): Promise<Task | null> {
    return await prisma.task.delete({
      where: { 
        id,
        tenantId
      }
    });
  }

  async updateTaskStatus(id: number, tenantId: string, status: TaskStatus): Promise<Task | null> {
    return await prisma.task.update({
      where: { 
        id,
        tenantId
      },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }
} 