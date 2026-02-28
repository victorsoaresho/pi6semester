import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID da resposta de cotação aceita' })
  @IsUUID()
  quoteResponseId: string;
}
