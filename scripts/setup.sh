#!/bin/bash

echo "🚀 Iniciando setup do Agendador de Tarefas..."

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Parar containers existentes (se houver)
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar os containers
echo "🔨 Construindo containers..."
docker-compose up --build -d

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 10

# Executar migrações
echo "🗄️ Executando migrações..."
docker-compose exec -T api npm run db:migrate

# Executar seed
echo "🌱 Populando banco com dados de exemplo..."
docker-compose exec -T api npm run db:seed

echo "✅ Setup concluído!"
echo "🌐 Acesse a aplicação em: http://localhost:3000"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker-compose logs -f api"
echo "  - Parar: docker-compose down"
echo "  - Reiniciar: docker-compose restart" 