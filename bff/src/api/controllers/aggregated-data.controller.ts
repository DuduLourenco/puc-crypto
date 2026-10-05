import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { GetAggregatedDataHandler } from '../../application/features/get-aggregated-data/get-aggregated-data.handler';
import { AccessToken } from '../auth/access-token.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AggregatedDataDto, AggregatedDataQueryDto } from '../dto/aggregated-data.dto';
import { ProblemDto } from '../dto/problem.dto';

@ApiTags('AggregatedData')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('aggregated-data')
export class AggregatedDataController {
  constructor(private readonly getAggregatedData: GetAggregatedDataHandler) {}

  @Get()
  @ApiOperation({
    summary: 'Dados do dashboard em uma única resposta.',
    description:
      'Consulta o Catalog (criptomoedas monitoradas pelo usuário), o MarketData (histórico de preços de cada uma) ' +
      'e a Azure Function GetForecast (previsão a partir do histórico), e devolve tudo em um único JSON. ' +
      'Se o MarketData ou a Function falharem para uma criptomoeda, ela volta com o status "unavailable".',
  })
  @ApiOkResponse({ type: AggregatedDataDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiUnauthorizedResponse({ type: ProblemDto })
  @ApiBadGatewayResponse({ type: ProblemDto, description: 'O Catalog não respondeu.' })
  get(@AccessToken() accessToken: string, @Query() query: AggregatedDataQueryDto): Promise<AggregatedDataDto> {
    return this.getAggregatedData.execute({ accessToken, horizon: query.horizon, historyLimit: query.historyLimit });
  }
}
