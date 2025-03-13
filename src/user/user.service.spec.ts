import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue("mockToken"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe("register", () => {
    it("should successfully register a user", async () => {
      const input = { email: "test@example.com", password: "password123", biometricKey: "bio123" };
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = {
        id: "1",
        email: input.email,
        password: hashedPassword,
        biometricKey: input.biometricKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(user);

      const result = await service.register(input);
      expect(result.token).toBe("mockToken");
      expect(result.user).toEqual(user);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: input.email,
          password: expect.any(String),
          biometricKey: input.biometricKey,
        }),
      });
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId: user.id });
    });

    it("should throw BadRequestException if email already exists", async () => {
      const input = { email: "test@example.com", password: "password123" };
      mockPrisma.user.create.mockRejectedValue({ code: "P2002" });

      await expect(service.register(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe("login", () => {
    it("should successfully login a user", async () => {
      const input = { email: "test@example.com", password: "password123" };
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = {
        id: "1",
        email: input.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

      const result = await service.login(input);
      expect(result.token).toBe("mockToken");
      expect(result.user).toEqual(user);
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId: user.id });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: "test@example.com", password: "password123" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const user = {
        id: "1",
        email: "test@example.com",
        password: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      await expect(service.login({ email: "test@example.com", password: "wrong" })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // Test Biometric Login
  describe("biometricLogin", () => {
    it("should successfully login with biometric key", async () => {
      const input = { biometricKey: "bio123" };
      const user = {
        id: "1",
        email: "test@example.com",
        biometricKey: input.biometricKey,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.biometricLogin(input);
      expect(result.token).toBe("mockToken");
      expect(result.user).toEqual(user);
      expect(mockJwt.sign).toHaveBeenCalledWith({ userId: user.id });
    });

    it("should throw UnauthorizedException if biometric key is invalid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.biometricLogin({ biometricKey: "invalid" })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
