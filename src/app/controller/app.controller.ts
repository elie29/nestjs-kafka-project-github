import { Controller } from '@nestjs/common';
import { AppService } from '../service/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  run() {
    console.log('Running Controller...');
    this.appService.waitForMessage('first-topic', 'first-group');

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      this.appService.disconnect();
    });
  }
}
