import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
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
}
