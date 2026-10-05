import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDto {
  @ApiProperty({ example: 'Catalog.CryptoNotFound' })
  title!: string;

  @ApiProperty({ example: 404 })
  status!: number;

  @ApiPropertyOptional({ example: 'Criptomoeda não encontrada no catálogo.' })
  detail?: string;
}
