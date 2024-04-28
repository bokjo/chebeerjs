import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupDocs } from "setup-docs";
import { SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const { document, swaggerOptions } = setupDocs(app);

  SwaggerModule.setup("/docs", app, document, swaggerOptions);

  await app.listen(3000);
  console.log({ beerjs: `Application is running on: ${await app.getUrl()}` });
}

bootstrap();
