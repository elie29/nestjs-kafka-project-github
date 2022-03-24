import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppController } from './app/controller/app.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appController = app.get(AppController);
  appController.run();

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => console.log(`Application listen on: ${PORT}`));
}

bootstrap();
