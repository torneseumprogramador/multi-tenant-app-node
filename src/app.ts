import express from 'express';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import { TenantMiddleware } from './middleware/tenant';
import taskRoutes from './routes/tasks';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Middleware para definir layout baseado na rota
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = 'admin/layouts/main';
  } else {
    res.locals.layout = 'layouts/main';
  }
  next();
});

// Middleware para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para flash messages
app.use((req, res, next) => {
  res.locals.success = (req as any).session?.flash?.success;
  res.locals.error = (req as any).session?.flash?.error;
  delete (req as any).session?.flash;
  next();
});

// Rota principal
app.get('/', (req, res) => {
  res.redirect('/tasks');
});

// Rotas do admin (sem tenant)
app.use('/admin', adminRoutes);

// Middleware para resolver tenant (apenas para rotas não-admin)
app.use((req, res, next) => {
  if (!req.path.startsWith('/admin')) {
    TenantMiddleware.resolveTenant(req, res, next);
  } else {
    next();
  }
});

// Rotas da aplicação (com tenant)
app.use('/tasks', TenantMiddleware.requireAuth, taskRoutes);

// Middleware de tratamento de erros
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Página não encontrada'
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).render('error', {
    message: 'Erro interno do servidor'
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});

export default app; 