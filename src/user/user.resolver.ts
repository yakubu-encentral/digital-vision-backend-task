import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser, JwtAuthGuard } from "../auth";
import { BiometricLoginInput, LoginInput, RegisterInput } from "./dto";
import { AuthResponse, User } from "./entities";
import { UserService } from "./user.service";

/**
 * Resolver for user-related GraphQL mutations.
 * Handles registration, login, and biometric login, and biometric key updates.
 */
@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  /**
   * Registers a new user.
   * @param input - Registration details (email, password, optional biometricKey)
   * @returns AuthResponse containing JWT token and user data
   */
  @Mutation(() => AuthResponse)
  async register(@Args("input") input: RegisterInput) {
    return this.userService.register(input);
  }

  /**
   * Authenticates a user using email and password.
   * @param input - Login details (email, password)
   * @returns AuthResponse containing JWT token and user data
   */
  @Mutation(() => AuthResponse)
  async login(@Args("input") input: LoginInput) {
    return this.userService.login(input);
  }

  /**
   * Authenticates a user using a biometric key.
   * @param input - Biometric login details (biometricKey)
   * @returns AuthResponse containing JWT token and user data
   */
  @Mutation(() => AuthResponse)
  async biometricLogin(@Args("input") input: BiometricLoginInput) {
    return this.userService.biometricLogin(input);
  }

  /**
   * Updates the biometric key for the authenticated user.
   * @param user - The authenticated user (from JWT)
   * @param newBiometricKey - The new biometric key to set
   * @returns Updated user data
   * @protected Requires JWT authentication
   */
  @Mutation(() => User)
  @UseGuards(JwtAuthGuard) // Ensures the user is authenticated
  async updateBiometricKey(
    @CurrentUser() user: any, // Retrieves the user from the request context
    @Args("newBiometricKey") newBiometricKey: string,
  ) {
    return this.userService.updateBiometricKey(user.id, newBiometricKey);
  }
}
