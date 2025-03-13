import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma";
import { JwtPayload } from "../types";

/**
 * JWT Strategy for Passport.js to validate JWT tokens.
 * Extracts the token from the Authorization header and verifies the user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!,
    });
  }

  /**
   * Validates the JWT payload and retrieves the corresponding user.
   * @param payload - Decoded JWT payload containing user ID
   * @returns The user if found, otherwise null
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
