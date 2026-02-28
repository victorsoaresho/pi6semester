import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDemandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Data limite no formato ISO' })
  @IsDateString()
  neededBy: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  conditions?: string;
}
