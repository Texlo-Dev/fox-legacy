import { INestApplication } from "@nestjs/common";
import { FastifyAdapter, NestFactory } from "@nestjs/core";
import { FoxClient } from "../util";
import { AppModule } from "./app.module";
export default async (client: FoxClient) => {
  const app: INestApplication = await NestFactory.create(
    AppModule,
    new FastifyAdapter()
  );
  app.use((req, res, next) => {
    req.client = client;
    next();
  });
  await app.listen(19520);
};
