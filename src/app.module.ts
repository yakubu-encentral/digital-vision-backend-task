import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { AuthModule } from "./auth";
import { PrismaModule } from "./prisma";
import { UserModule } from "./user";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      context: ({ req }) => ({ req }), // Pass the request object to the context
      formatError: (error) => {
        const originalError = error.extensions?.originalError as any;

        if (!originalError) {
          return {
            message: error.message,
            code: error.extensions?.code,
          };
        }
        return {
          message: originalError.message,
          code: error.extensions?.code,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}
