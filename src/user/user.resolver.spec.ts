import { Test, TestingModule } from "@nestjs/testing";
import { LoginInput, RegisterInput } from "./dto";
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
    }).compile();

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
});
