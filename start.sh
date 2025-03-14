#!/bin/bash

echo "Installing dependencies..."
npm install || { echo "npm install failed"; exit 1; }

echo "Starting PostgreSQL..."
docker-compose up -d || { echo "docker-compose up failed"; exit 1; }

echo "Waiting for database to be ready..."
sleep 5

echo "Applying Prisma migrations..."
npx prisma migrate deploy || { echo "Prisma migrate deploy failed"; exit 1; }

echo "Starting NestJS application..."
npm run start:dev || { echo "Failed to start NestJS application"; exit 1; }