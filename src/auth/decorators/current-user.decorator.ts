import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

/**
 * Custom decorator to retrieve the authenticated user from the GraphQL context.
 * Used in resolvers to access the current user without passing it manually.
 */
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
