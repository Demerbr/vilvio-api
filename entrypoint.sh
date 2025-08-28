#!/bin/sh

echo "Waiting for postgres..."

# Função para verificar se o postgres está disponível
wait_for_postgres() {
  while ! nc -z postgres 5432; do
    echo "Postgres is unavailable - sleeping"
    sleep 1
  done
  echo "Postgres is up - continuing..."
}

wait_for_postgres

echo "PostgreSQL started"

echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "Migration failed, but continuing..."

echo "Starting application..."
exec npm run start:prod