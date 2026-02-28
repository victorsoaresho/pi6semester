import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondQuoteDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ description: 'Prazo de entrega em dias' })
  @IsNumber()
  @Min(1)
  leadTimeDays: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  conditions?: string;
}
