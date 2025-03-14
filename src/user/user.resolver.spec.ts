import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "../auth";
import { BiometricLoginInput, LoginInput, RegisterInput } from "./dto";
import { AuthResponse, User } from "./entities";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";

describe("UserResolver", () => {
  let resolver: UserResolver;
  let userService: UserService;

  // Mock user data
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse: AuthResponse = {
    token: "mockToken",
    user: mockUser,
  };

  // Mock UserService methods
  const mockUserService = {
    register: jest.fn(),
    login: jest.fn(),
    biometricLogin: jest.fn(),
    updateBiometricKey: jest.fn(),
  };

  // Set up the testing module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, { provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const ctx = GqlExecutionContext.create(context);
          ctx.getContext().req.user = { id: "1", email: "test@example.com" };
          return true;
        },
      })
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test the register mutation
  describe("register", () => {
    it("should call userService.register and return AuthResponse", async () => {
      const input: RegisterInput = {
        email: "test@example.com",
        password: "password123",
        biometricKey: "bio123",
      };

      mockUserService.register.mockResolvedValue(mockAuthResponse);

      const result = await resolver.register(input);
      expect(result).toEqual(mockAuthResponse);
      expect(mockUserService.register).toHaveBeenCalledWith(input);
    });
  });

  // Test the login mutation
  describe("login", () => {
    it("should call userService.login and return AuthResponse", async () => {
      const input: LoginInput = {
        email: "test@example.com",
        password: "password123",
      };

      mockUserService.login.mockResolvedValue(mockAuthResponse);

      const result = await resolver.login(input);
      expect(result).toEqual(mockAuthResponse);
      expect(mockUserService.login).toHaveBeenCalledWith(input);
    });
  });

  // Test the biometricLogin mutation
  describe("biometricLogin", () => {
    it("should call userService.biometricLogin and return AuthResponse", async () => {
      const input: BiometricLoginInput = {
        biometricKey: "bio123",
      };

      mockUserService.biometricLogin.mockResolvedValue(mockAuthResponse);

      const result = await resolver.biometricLogin(input);
      expect(result).toEqual(mockAuthResponse);
      expect(mockUserService.biometricLogin).toHaveBeenCalledWith(input);
    });
  });

  // Test the updateBiometricKey mutation
  describe("updateBiometricKey", () => {
    it("should call userService.updateBiometricKey with user ID and new key", async () => {
      const newBiometricKey = "newBio456";
      const updatedUser = { ...mockUser, biometricKey: newBiometricKey };

      // Mock the current user (simulating JWT guard)
      const mockCurrentUser = { id: "1" };

      mockUserService.updateBiometricKey.mockResolvedValue(updatedUser);

      const result = await resolver.updateBiometricKey(mockCurrentUser, newBiometricKey);
      expect(result).toEqual(updatedUser);
      expect(mockUserService.updateBiometricKey).toHaveBeenCalledWith("1", newBiometricKey);
    });
  });
});
