import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class PricePointDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  cryptocurrencyId!: string;

  @ApiProperty({ format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: 65000.12 })
  priceUsd!: number;

  @ApiProperty({ enum: ['CoinGecko', 'Manual'] })
  source!: string;
}

export class CreatePricePointDto {
  @ApiProperty({ format: 'uuid' })
  cryptocurrencyId!: string;

  @ApiProperty({ format: 'date-time', example: '2026-06-15T10:00:00Z' })
  timestamp!: string;

  @ApiProperty({ example: 65000.12 })
  priceUsd!: number;
}

export class UpdatePricePointDto {
  @ApiProperty({ example: 65100.5 })
  priceUsd!: number;
}

export class ListPricePointsQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cryptocurrencyId!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 1000, description: 'Quantidade máxima de preços (os mais recentes).' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class TrackedAssetDto {
  @ApiProperty({ format: 'uuid' })
  cryptocurrencyId!: string;

  @ApiProperty({ example: 'bitcoin' })
  coinGeckoId!: string;

  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;

  @ApiProperty({ format: 'date-time' })
  trackedSince!: string;
}
