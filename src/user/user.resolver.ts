import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { RegisterInput } from "./dto";
import { AuthResponse } from "./entities";
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
}
