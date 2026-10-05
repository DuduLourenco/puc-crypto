import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CryptoDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;

  @ApiProperty({ example: 'bitcoin' })
  coinGeckoId!: string;

  @ApiPropertyOptional({ type: Number, nullable: true, description: 'Último preço em dólar, recebido do MarketData.' })
  latestPriceUsd!: number | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  latestPriceAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class CreateCryptoDto {
  @ApiProperty({ example: 'bitcoin', description: 'Identificador da moeda na API CoinGecko.' })
  coinGeckoId!: string;

  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;
}

export class UpdateCryptoDto {
  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;
}

export class UserCryptoDto {
  @ApiProperty({ format: 'uuid', description: 'Id do item na lista do usuário.' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  cryptocurrencyId!: string;

  @ApiProperty({ example: 'BTC' })
  symbol!: string;

  @ApiProperty({ example: 'Bitcoin' })
  name!: string;

  @ApiProperty({ example: 'bitcoin' })
  coinGeckoId!: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  latestPriceUsd!: number | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  latestPriceAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'longo prazo' })
  notes!: string | null;

  @ApiProperty({ format: 'date-time' })
  addedAt!: string;
}

export class AddUserCryptoDto {
  @ApiProperty({ format: 'uuid', description: 'Id de uma criptomoeda do catálogo.' })
  cryptocurrencyId!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'longo prazo' })
  notes?: string | null;
}

export class UpdateUserCryptoDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: 'reavaliar em dezembro' })
  notes?: string | null;
}
