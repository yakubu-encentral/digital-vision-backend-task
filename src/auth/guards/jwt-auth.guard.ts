import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

/**
 * Authentication guard that uses the JWT strategy to protect routes.
 * Ensures that only requests with a valid JWT token can access protected mutations.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req; // Extract the request from the GraphQL context
  }
}
