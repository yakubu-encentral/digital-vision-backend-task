# NestJS Backend Test Task

A GraphQL API service built with NestJS, TypeScript, Prisma, and PostgreSQL for user authentication, including standard and biometric login features.

## Table of Contents  
- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [GraphQL Schema and Examples](#graphql-schema-and-examples)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Notes](#notes)

---

## Introduction

This project is a backend test task demonstrating a GraphQL API built with NestJS. It provides user authentication functionality, including registration, standard login with email and password, biometric login using a simulated biometric key, and the ability to update the biometric key. The application uses PostgreSQL as the database, managed through Prisma ORM, and incorporates JWT-based authentication for security.

---

## Features

- **User Registration**: Register with email, password, and an optional biometric key.
- **Standard Login**: Authenticate using email and password.
- **Biometric Login**: Authenticate using a simulated biometric key (a unique string).
- **Update Biometric Key**: Authenticated users can update their biometric key.
- **Security**: Passwords are hashed using bcrypt, and JWT tokens are used for authentication.
- **Database**: PostgreSQL with Prisma ORM for data management.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (>= 14.x)
- **npm** (Node Package Manager)
- **Docker** (for running PostgreSQL)
- **Postman** or a GraphQL client (e.g., GraphQL Playground, Altair)

---

## Setup Instructions

Follow these steps to set up and run the project locally:

1. **Clone the Repository**  
   Clone the project from the repository and navigate into the directory:  
   ```bash
   git clone <repository-url>
   cd project-name
2. **Install Dependencies**  
   Install the required Node.js packages:  
   ```bash
   npm install
3. **Set Up Environment Variables**  
   Copy the example environment file and update it with your configuration:  
   ```bash
   cp .env.example .env
   ```
   Edit .env with your PostgreSQL and JWT settings:  
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   JWT_SECRET="your-secret-key"
   ```
   Generate a new secured JWT_SECRET with openssl or node 
   ```bash
   openssl rand -base64 32
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
4. **Start PostgreSQL with Docker**  
   Use Docker Compose to start a PostgreSQL instance:  
   ```bash
   docker-compose up -d
5. **Run Prisma Migrations**  
   Apply the database schema and migrations:  
    ```bash
    npx prisma migrate dev --name init
6. **Generate Prisma Client**  
    Generate the Prisma client for TypeScript:  
    ```bash
    npx prisma generate
7. **Start the Application**  
    Launch the NestJS application in development mode:  
    ```bash
    npm run start:dev
8. **Access GraphQL Playground**  
Open your browser or GraphQL client at:
http://localhost:3000/graphql. Ensure port 3000 is available.
9. **Automated Setup**  
A bash and batch script are provided to automate the setup and run the application.
    ```bash
    chmod +x start.sh
    ./start.sh
    ```
    ```cmd
    start.bat
---

## GraphQL Schema and Examples
The API uses GraphQL mutations for user management and authentication. The schema is auto-generated and available in src/schema.gql.  
**Register**
* Description: Registers a new user with email, password, and an optional biometric key.  
* Mutation:  
  ```graphql
  mutation {
    register(input: { email: "user@example.com", password: "pass123", biometricKey: "bio123" }) {
      token
      user {
        id
        email
        createdAt
        updatedAt
      }
    }
  }
**Login**
* Description: Authenticates a user using email and password.  
* Mutation:  
  ```graphql
  mutation {
    login(input: { email: "user@example.com", password: "pass123" }) {
      token
      user {
        id
        email
      }
    }
  }
**Biometric Login**
* Description: Authenticates a user using their biometric key.  
* Mutation:  
  ```graphql
  mutation {
    biometricLogin(input: { biometricKey: "bio123" }) {
      token
      user {
        id
        email
      }
    }
  }
**Update Biometric Key**
* Description: Updates the biometric key for an authenticated user. Requires a JWT token in the Authorization header (Bearer <token>).  
* Mutation:  
  ```graphql
  mutation {
    updateBiometricKey(newBiometricKey: "newBio456") {
      id
      email
      biometricKey
    }
  }

---

## Testing
The project includes both unit and end-to-end (E2E) tests.  
**Unit Tests**
* Description: Tests for services and resolvers (e.g., registration, login logic).  
* Command:  
  ```bash
  npm run test
* Coverage: Validates core business logic.  
**End-to-End (E2E) Tests**
* Description: Simulates API requests and database interactions.  
* Command:  
  ```bash
  npm run test:e2e
* Coverage: Tests full workflows like registration, login, biometric login, and biometric key updates.

---

## Project Structure
Here’s an overview of the project’s directory structure:  
```
project-name/
├── docker-compose.yml         # Docker configuration for PostgreSQL
├── prisma/
│   ├── schema.prisma          # Prisma schema defining the User model
│   └── migrations/            # Auto-generated migration files
├── src/
│   ├── app.module.ts          # Root module of the application
│   ├── main.ts                # Application entry point
│   ├── auth/                  # Authentication module (JWT, guards, etc.)
│   ├── user/                  # User module (services, resolvers, DTOs)
│   └── prisma/                # Prisma service for database access
├── test/                      # E2E test files
├── .env.example               # Example environment variables
└── README.md                  # This documentation file
```

---

## Troubleshooting
Common issues and their solutions:
* **Database Connection Fails:**  
  - Check if PostgreSQL is running: docker ps  
  - Verify DATABASE_URL in .env matches your Docker setup.
* **Prisma Migration Errors:**  
  - Ensure PostgreSQL is running and run:  
    ```bash
    npx prisma migrate dev --name init
  - Check schema.prisma for syntax errors.
* **GraphQL Playground Not Loading:**  
  - Confirm the app is running (npm run start:dev) and visit http://localhost:3000/graphql.
* **Authentication Errors:**  
  - Ensure the Authorization header is set as Bearer <token> for protected routes.  
  - Verify the token hasn’t expired (default: 60 minutes).

---

## Notes  
- The biometric key is a simulated string for demonstration purposes.  
- Passwords are hashed with bcrypt for security.  
- JWT tokens expire after 60 minutes (configurable in auth.module.ts).  
- Sensitive data (e.g., password) is excluded from API responses.
