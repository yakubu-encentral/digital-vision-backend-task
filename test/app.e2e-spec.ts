/* eslint-disable */
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("App (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  // GraphQL query/mutation helper
  const gqlRequest = (query: string) =>
    request(server).post("/graphql").send({ query }).set("Accept", "application/json");

  // Setup before all tests
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
    server = app.getHttpServer();

    // Clean the database before tests
    await prisma.user.deleteMany({});
  });

  // Cleanup after all tests
  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe("User Registration", () => {
    it("should register a new user and return a token", async () => {
      const mutation = `
        mutation {
          register(input: { email: "test@example.com", password: "password123", biometricKey: "bio123" }) {
            token
            user {
              id
              email
              createdAt
              updatedAt
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);

      expect(response.body.data.register).toBeDefined();
      expect(response.body.data.register.token).toBeDefined();
      expect(response.body.data.register.user.email).toBe("test@example.com");
      expect(response.body.data.register.user.id).toBeDefined();
    });

    it("should fail to register with an existing email", async () => {
      const mutation = `
        mutation {
          register(input: { email: "test@example.com", password: "newpass" }) {
            token
            user {
              id
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Email or biometric key already exists");
    });
  });

  describe("Standard Login", () => {
    it("should login a user and return a token", async () => {
      const mutation = `
        mutation {
          login(input: { email: "test@example.com", password: "password123" }) {
            token
            user {
              id
              email
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);

      expect(response.body.data.login).toBeDefined();
      expect(response.body.data.login.token).toBeDefined();
      expect(response.body.data.login.user.email).toBe("test@example.com");
    });

    it("should fail login with incorrect password", async () => {
      const mutation = `
        mutation {
          login(input: { email: "test@example.com", password: "wrongpass" }) {
            token
            user {
              id
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid credentials");
    });
  });

  describe("Biometric Login", () => {
    it("should login with biometric key and return a token", async () => {
      const mutation = `
        mutation {
          biometricLogin(input: { biometricKey: "bio123" }) {
            token
            user {
              id
              email
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);

      expect(response.body.data.biometricLogin).toBeDefined();
      expect(response.body.data.biometricLogin.token).toBeDefined();
      expect(response.body.data.biometricLogin.user.email).toBe("test@example.com");
    });

    it("should fail biometric login with invalid key", async () => {
      const mutation = `
        mutation {
          biometricLogin(input: { biometricKey: "invalidKey" }) {
            token
            user {
              id
            }
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid biometric key");
    });
  });

  describe("Update Biometric Key", () => {
    let token: string;

    beforeAll(async () => {
      // Login to get a valid token
      const loginMutation = `
        mutation {
          login(input: { email: "test@example.com", password: "password123" }) {
            token
          }
        }
      `;
      const loginResponse = await gqlRequest(loginMutation).expect(200);
      token = loginResponse.body.data.login.token;
    });

    it("should update biometric key with valid token", async () => {
      const mutation = `
        mutation {
          updateBiometricKey(newBiometricKey: "newBio456") {
            id
            email
            createdAt
            updatedAt
          }
        }
      `;

      const response = await request(server)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({ query: mutation })
        .expect(200);

      expect(response.body.data.updateBiometricKey).toBeDefined();
      expect(response.body.data.updateBiometricKey.email).toBe("test@example.com");
    });

    it("should fail to update biometric key without token", async () => {
      const mutation = `
        mutation {
          updateBiometricKey(newBiometricKey: "newBio789") {
            id
          }
        }
      `;

      const response = await gqlRequest(mutation).expect(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain("Unauthorized");
    });
  });
});
