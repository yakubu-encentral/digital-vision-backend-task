import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";

/**
 * Custom decorator to retrieve the authenticated user from the GraphQL context.
 * Used in resolvers to access the current user without passing it manually.
 */
export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const request = ctx.getContext<{ req: Request }>().req; // Explicitly define req type
  return request.user;
});
