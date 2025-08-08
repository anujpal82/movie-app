import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Movies API")
    .setDescription("API documentation for Movies app")
    .setVersion("1.0.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .addServer(
      "http://localhost:3001/api",
      "Local development server with API prefix"
    )
    .addServer("http://56.228.5.205/api", "Production server with API prefix")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
  console.log(`API endpoints available at: http://localhost:${port}`);
}
bootstrap();
