# 📋 Agendador de Tarefas

Uma aplicação completa de agendador de tarefas (to-do list) desenvolvida com Node.js, TypeScript, Express, EJS e PostgreSQL.

## 🚀 Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express.js** para o servidor web
- **EJS** como mecanismo de template
- **PostgreSQL** como banco de dados
- **Prisma ORM** para gerenciamento do banco
- **Docker Compose** para orquestração

## ✨ Funcionalidades

- ✅ Criar, editar, excluir e listar tarefas
- ✅ Cada tarefa contém: título, descrição, data de vencimento e status
- ✅ Status das tarefas: Pendente, Em Andamento, Concluída
- ✅ Filtros por status
- ✅ Validação de formulários
- ✅ Interface responsiva e moderna
- ✅ Atualização de status via AJAX

## 🛠️ Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

## 🚀 Como Executar

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd multtanant
```

### 2. Execute com Docker Compose
```bash
# Construir e iniciar os containers
docker-compose up --build

# Para executar em background
docker-compose up -d --build
```

### 3. Acesse a aplicação
Abra seu navegador e acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores da aplicação
├── services/        # Lógica de negócio
├── routes/          # Definição das rotas
├── views/           # Templates EJS
│   ├── layouts/     # Layouts base
│   └── tasks/       # Views das tarefas
├── prisma/          # Configuração do Prisma
└── app.ts          # Arquivo principal

prisma/
├── schema.prisma    # Schema do banco de dados
└── seed.ts         # Dados iniciais

Dockerfile          # Configuração do container
docker-compose.yml  # Orquestração dos serviços
```

## 🗄️ Banco de Dados

### Modelo Task
- `id`: Identificador único
- `title`: Título da tarefa (obrigatório)
- `description`: Descrição detalhada (opcional)
- `dueDate`: Data de vencimento (opcional)
- `status`: Status da tarefa (PENDING, IN_PROGRESS, COMPLETED)
- `createdAt`: Data de criação
- `updatedAt`: Data de última atualização

### Status das Tarefas
- **PENDING**: Tarefa pendente
- **IN_PROGRESS**: Tarefa em andamento
- **COMPLETED**: Tarefa concluída

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Compilar TypeScript
npm run build

# Executar aplicação compilada
npm start
```

### Banco de Dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados de exemplo
npm run db:seed

# Abrir Prisma Studio
npm run db:studio
```

### Docker
```bash
# Construir containers
docker-compose build

# Iniciar serviços
docker-compose up

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f api
```

## 🌐 Rotas da Aplicação

- `GET /` - Redireciona para `/tasks`
- `GET /tasks` - Lista todas as tarefas
- `GET /tasks/create` - Formulário de criação
- `POST /tasks` - Criar nova tarefa
- `GET /tasks/:id/edit` - Formulário de edição
- `PUT /tasks/:id` - Atualizar tarefa
- `DELETE /tasks/:id` - Excluir tarefa
- `PATCH /tasks/:id/status` - Atualizar status (AJAX)

## 🎨 Interface

A aplicação possui uma interface moderna e responsiva com:

- Design limpo e intuitivo
- Gradientes e sombras para profundidade
- Animações suaves
- Layout responsivo para mobile
- Feedback visual para ações
- Filtros por status
- Cards organizados em grid

## 🔒 Validações

- Título: obrigatório, 1-100 caracteres
- Descrição: opcional, máximo 500 caracteres
- Data de vencimento: formato ISO válido
- Status: valores permitidos (PENDING, IN_PROGRESS, COMPLETED)

## 🐛 Solução de Problemas

### Problema: Erro de conexão com banco
```bash
# Verificar se o container do banco está rodando
docker-compose ps

# Reiniciar apenas o banco
docker-compose restart db
```

### Problema: Erro de migração
```bash
# Executar migrações manualmente
docker-compose exec api npm run db:migrate
```

### Problema: Dados não aparecem
```bash
# Executar seed manualmente
docker-compose exec api npm run db:seed
```

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

Seu Nome - [seu-email@exemplo.com] 