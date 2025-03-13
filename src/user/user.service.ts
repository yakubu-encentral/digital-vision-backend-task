import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { BiometricLoginInput, LoginInput } from "./dto";
import { RegisterInput } from "./dto/register.input";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user with email, password, and optional biometric key.
   * @param input - Registration details (email, password, biometricKey)
   * @returns AuthResponse with JWT token and user data
   * @throws BadRequestException if email or biometric key already exists
   */
  async register(input: RegisterInput) {
    const { email, password, biometricKey } = input;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          biometricKey,
        },
      });

      const token = this.jwtService.sign({ userId: user.id });
      return { token, user };
    } catch (error) {
      // Handle unique constraint violations (e.g., duplicate email or biometric key)
      if (error.code === "P2002") {
        throw new BadRequestException("Email or biometric key already exists");
      }

      throw error;
    }
  }

  /**
   * Authenticates a user using email and password.
   * @param input - Login details (email, password)
   * @returns AuthResponse with JWT token and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(input: LoginInput) {
    const { email, password } = input;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { token, user };
  }

  /**
   * Authenticates a user using a biometric key (simulated as a string).
   * @param input - Biometric login details (biometricKey)
   * @returns AuthResponse with JWT token and user data
   * @throws UnauthorizedException if biometric key is invalid
   */
  async biometricLogin(input: BiometricLoginInput) {
    const { biometricKey } = input;
    const user = await this.prisma.user.findUnique({ where: { biometricKey } });
    if (!user) {
      throw new UnauthorizedException("Invalid biometric key");
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { token, user };
  }
}
