@echo off

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
  echo npm install failed
  exit /b 1
)

echo Starting PostgreSQL...
call docker-compose up -d
if %errorlevel% neq 0 (
  echo docker-compose up failed
  exit /b 1
)

echo Waiting for database to be ready...
timeout /t 5

echo Applying Prisma migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
  echo Prisma migrate deploy failed
  exit /b 1
)

echo Starting NestJS application...
call npm run start:dev
if %errorlevel% neq 0 (
  echo Failed to start NestJS application
  exit /b 1
)