import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppResolver (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/graphql (POST)", () => {
    return request(app.getHttpServer())
      .post("/graphql")
      .send({ query: "{ hello }" })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.hello).toBe("Hello World!");
      });
  });
});
