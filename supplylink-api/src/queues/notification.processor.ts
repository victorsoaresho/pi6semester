import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processando notificação: ${job.name} — ${JSON.stringify(job.data)}`);

    switch (job.name) {
      case 'send-email':
        // TODO: integrar Nodemailer para envio real
        this.logger.log(`E-mail enviado para: ${job.data.to}`);
        break;
      case 'push-notification':
        // TODO: integrar FCM para push notification
        this.logger.log(`Push notification enviada para userId: ${job.data.userId}`);
        break;
      default:
        this.logger.warn(`Job desconhecido: ${job.name}`);
    }
  }
}
