import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma";
import { UserService } from "./user.service";
import { BadRequestException } from "@nestjs/common";

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

  it("should register a user", async () => {
    const input = { email: "test@example.com", password: "password123" };
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = {
      id: "1",
      email: input.email,
      password: hashedPassword,
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
      }),
    });
  });

  it("should throw BadRequestException if email already exists", async () => {
    const input = { email: "test@example.com", password: "password123" };
    mockPrisma.user.create.mockRejectedValue({ code: "P2002" });

    await expect(service.register(input)).rejects.toThrow(BadRequestException);
  });
});
