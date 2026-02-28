import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);
  private readonly mlBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.mlBaseUrl = this.config.get<string>('ml.serviceUrl');
  }

  async getForecast(factoryId: string, productId: string, horizonDays = 30) {
    try {
      const response = await fetch(`${this.mlBaseUrl}/forecast/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          factory_id: factoryId,
          horizon_days: horizonDays,
        }),
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `ML Service retornou status ${response.status}`,
        );
      }

      const data = await response.json();
      const predictions: Array<{
        date: string;
        quantity: number;
        model_version?: string;
      }> = data.predictions ?? [];

      const records = predictions.map((p) => ({
        factoryId,
        productId,
        forecastDate: new Date(p.date),
        predictedQuantity: p.quantity,
        horizonDays,
        modelVersion: p.model_version ?? data.model_version ?? 'v1',
      }));

      if (records.length > 0) {
        await this.prisma.demandForecast.createMany({ data: records });
      }

      return predictions;
    } catch (error) {
      this.logger.error('Erro ao obter previsão do ML Service', error);
      throw new InternalServerErrorException(
        'Falha ao obter previsão de demanda',
      );
    }
  }

  async getAlerts(factoryId: string) {
    const forecasts = await this.prisma.demandForecast.findMany({
      where: {
        factoryId,
        predictedQuantity: { gte: 1000 },
      },
      include: { product: true },
      orderBy: { predictedQuantity: 'desc' },
      take: 50,
    });

    return forecasts.map((f) => ({
      id: f.id,
      productId: f.productId,
      productName: f.product.name,
      forecastDate: f.forecastDate,
      predictedQuantity: f.predictedQuantity,
      horizonDays: f.horizonDays,
    }));
  }

  async triggerTraining() {
    try {
      const response = await fetch(`${this.mlBaseUrl}/train/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `ML Service retornou status ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error('Erro ao disparar treinamento no ML Service', error);
      throw new InternalServerErrorException(
        'Falha ao disparar treinamento do modelo',
      );
    }
  }
}
