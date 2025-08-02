import { PrismaClient, TaskStatus, TaskPriority, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenantConfig.deleteMany();
  await prisma.tenant.deleteMany();

  // Criar tenants de exemplo
  const tenants = [
    {
      name: 'Empresa ABC',
      slug: 'empresa-abc',
      domain: 'abc.localhost:3000',
      config: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1d4ed8',
        companyName: 'Empresa ABC Ltda',
        companyEmail: 'contato@empresaabc.com',
        companyPhone: '(11) 99999-9999',
        companyAddress: 'Rua das Flores, 123 - São Paulo/SP'
      }
    },
    {
      name: 'Startup XYZ',
      slug: 'startup-xyz',
      domain: 'xyz.localhost:3000',
      config: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        companyName: 'Startup XYZ',
        companyEmail: 'hello@startupxyz.com',
        companyPhone: '(21) 88888-8888',
        companyAddress: 'Av. Paulista, 1000 - São Paulo/SP'
      }
    },
    {
      name: 'Consultoria Tech',
      slug: 'consultoria-tech',
      domain: 'tech.localhost:3000',
      config: {
        primaryColor: '#f59e0b',
        secondaryColor: '#d97706',
        companyName: 'Consultoria Tech',
        companyEmail: 'info@consultoriatech.com',
        companyPhone: '(31) 77777-7777',
        companyAddress: 'Rua da Tecnologia, 456 - Belo Horizonte/MG'
      }
    }
  ];

  for (const tenantData of tenants) {
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantData.name,
        slug: tenantData.slug,
        domain: tenantData.domain,
        config: {
          create: {
            primaryColor: tenantData.config.primaryColor,
            secondaryColor: tenantData.config.secondaryColor,
            companyName: tenantData.config.companyName,
            companyEmail: tenantData.config.companyEmail,
            companyPhone: tenantData.config.companyPhone,
            companyAddress: tenantData.config.companyAddress
          }
        }
      },
      include: {
        config: true
      }
    });

    // Criar usuário admin para cada tenant
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123', // Em produção, usar hash
        role: UserRole.ADMIN,
        tenantId: tenant.id
      }
    });

    // Criar usuário comum para cada tenant
    const user = await prisma.user.create({
      data: {
        name: 'Usuário Comum',
        email: 'user@example.com',
        password: 'user123', // Em produção, usar hash
        role: UserRole.USER,
        tenantId: tenant.id
      }
    });

    // Criar tarefas de exemplo para cada tenant
    const tasks = [
      {
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Instalar e configurar todas as ferramentas necessárias para o projeto',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        tags: ['desenvolvimento', 'configuração'],
        userId: admin.id
      },
      {
        title: 'Revisar documentação da API',
        description: 'Atualizar e melhorar a documentação da API REST',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        tags: ['documentação', 'api'],
        userId: user.id
      },
      {
        title: 'Implementar testes unitários',
        description: 'Criar testes para os principais componentes da aplicação',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        tags: ['testes', 'qualidade'],
        userId: admin.id
      },
      {
        title: 'Otimizar performance do banco',
        description: 'Analisar e otimizar as consultas mais lentas do banco de dados',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: TaskStatus.PENDING,
        priority: TaskPriority.URGENT,
        tags: ['performance', 'banco'],
        userId: user.id
      },
      {
        title: 'Preparar apresentação para cliente',
        description: 'Criar slides e material para apresentação do projeto',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        tags: ['apresentação', 'cliente'],
        userId: admin.id
      }
    ];

    for (const taskData of tasks) {
      await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate,
          status: taskData.status,
          priority: taskData.priority,
          tags: taskData.tags,
          tenantId: tenant.id,
          userId: taskData.userId
        }
      });
    }

    console.log(`✅ Tenant "${tenant.name}" criado com sucesso!`);
  }

  console.log('✅ Seed concluído! Tenants e dados de exemplo criados.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 