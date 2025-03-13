import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { join } from "path";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
    }),
    PrismaModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}
