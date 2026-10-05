import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  DEFAULT_FORECAST_HORIZON,
  DEFAULT_HISTORY_LIMIT,
  MAX_FORECAST_HORIZON,
  MAX_HISTORY_LIMIT,
  MIN_POINTS_FOR_FORECAST,
} from '../../domain/aggregated-data';

export class AggregatedDataQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_FORECAST_HORIZON,
    default: DEFAULT_FORECAST_HORIZON,
    description: 'Quantos passos prever para cada criptomoeda.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_FORECAST_HORIZON)
  horizon?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_HISTORY_LIMIT,
    default: DEFAULT_HISTORY_LIMIT,
    description: 'Quantos preços do histórico buscar para cada criptomoeda.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HISTORY_LIMIT)
  historyLimit?: number;
}

export class HistoryPointDto {
  @ApiProperty({ format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: 65000.12 })
  priceUsd!: number;
}

export class ForecastPointDto {
  @ApiProperty({ format: 'date-time' })
  timestamp!: string;

  @ApiProperty({ example: 65210.4 })
  priceUsd!: number;

  @ApiProperty({ example: 63180.2, description: 'Limite inferior do intervalo de 95%.' })
  lowerUsd!: number;

  @ApiProperty({ example: 67240.6, description: 'Limite superior do intervalo de 95%.' })
  upperUsd!: number;
}

export class CryptoForecastDto {
  @ApiProperty({ example: 'ML.NET SDCA: regressão linear sobre as variações dos 7 preços anteriores' })
  model!: string;

  @ApiProperty({ example: 7 })
  horizon!: number;

  @ApiProperty({ type: [ForecastPointDto] })
  points!: ForecastPointDto[];
}

export class CryptoAggregateDto {
  @ApiProperty({ format: 'uuid', description: 'Id do item na lista do usuário (Catalog).' })
  userCryptoId!: string;

  @ApiProperty({ format: 'uuid' })
  cryptocurrencyId!: string;

  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;

  @ApiProperty({ example: 'bitcoin' })
  coinGeckoId!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  latestPriceUsd!: number | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  latestPriceAt!: string | null;

  @ApiProperty({ enum: ['ok', 'unavailable'], description: 'Situação da consulta ao MarketData.' })
  historyStatus!: string;

  @ApiProperty({ type: [HistoryPointDto], description: 'Histórico de preços, do mais antigo ao mais recente (MarketData).' })
  history!: HistoryPointDto[];

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Variação percentual no período do histórico.' })
  periodChangePercent!: number | null;

  @ApiProperty({
    enum: ['ok', 'insufficient-history', 'unavailable'],
    description: `Situação da previsão. "insufficient-history": menos de ${MIN_POINTS_FOR_FORECAST} preços.`,
  })
  forecastStatus!: string;

  @ApiPropertyOptional({ type: CryptoForecastDto, nullable: true, description: 'Previsão calculada pela Azure Function.' })
  forecast!: CryptoForecastDto | null;
}

export class AggregatedDataDto {
  @ApiProperty({ format: 'date-time' })
  generatedAt!: string;

  @ApiProperty({ type: [CryptoAggregateDto] })
  cryptos!: CryptoAggregateDto[];
}
