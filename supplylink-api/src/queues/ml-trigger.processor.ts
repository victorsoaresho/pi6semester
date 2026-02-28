import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Processor('ml-trigger')
export class MlTriggerProcessor extends WorkerHost {
  private readonly logger = new Logger(MlTriggerProcessor.name);

  constructor(private configService: ConfigService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Disparando treinamento ML: ${JSON.stringify(job.data)}`);

    const mlUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');

    try {
      const response = await fetch(`${mlUrl}/train/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job.data),
      });

      const result = await response.json();
      this.logger.log(`Treinamento finalizado: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Erro ao disparar treinamento ML: ${error.message}`);
      throw error;
    }
  }
}
