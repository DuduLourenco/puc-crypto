import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreatePricePointHandler } from '../../application/features/create-price-point/create-price-point.handler';
import { DeletePricePointHandler } from '../../application/features/delete-price-point/delete-price-point.handler';
import { GetPricePointHandler } from '../../application/features/get-price-point/get-price-point.handler';
import { ListPricePointsHandler } from '../../application/features/list-price-points/list-price-points.handler';
import { ListTrackedAssetsHandler } from '../../application/features/list-tracked-assets/list-tracked-assets.handler';
import { UpdatePricePointHandler } from '../../application/features/update-price-point/update-price-point.handler';
import { AccessToken } from '../auth/access-token.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePricePointDto, ListPricePointsQueryDto, PricePointDto, TrackedAssetDto, UpdatePricePointDto } from '../dto/price.dto';
import { ProblemDto } from '../dto/problem.dto';

@ApiTags('Prices')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ProblemDto })
@UseGuards(JwtAuthGuard)
@Controller()
export class PricesController {
  constructor(
    private readonly listTrackedAssets: ListTrackedAssetsHandler,
    private readonly listPricePoints: ListPricePointsHandler,
    private readonly getPricePoint: GetPricePointHandler,
    private readonly createPricePoint: CreatePricePointHandler,
    private readonly updatePricePoint: UpdatePricePointHandler,
    private readonly deletePricePoint: DeletePricePointHandler,
  ) {}

  @Get('assets')
  @ApiOperation({ summary: 'Lista as criptomoedas acompanhadas pelo MarketData (repassa ao MarketData).' })
  @ApiOkResponse({ type: [TrackedAssetDto] })
  assets(@AccessToken() accessToken: string): Promise<TrackedAssetDto[]> {
    return this.listTrackedAssets.execute({ accessToken });
  }

  @Get('prices')
  @ApiOperation({ summary: 'Lista o histórico de preços de uma criptomoeda (repassa ao MarketData).' })
  @ApiOkResponse({ type: [PricePointDto] })
  @ApiBadRequestResponse({ type: ProblemDto })
  list(@AccessToken() accessToken: string, @Query() query: ListPricePointsQueryDto): Promise<PricePointDto[]> {
    return this.listPricePoints.execute({ accessToken, filter: { ...query } });
  }

  @Get('prices/:id')
  @ApiOperation({ summary: 'Devolve um preço (repassa ao MarketData).' })
  @ApiOkResponse({ type: PricePointDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  get(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<PricePointDto> {
    return this.getPricePoint.execute({ accessToken, id });
  }

  @Post('prices')
  @ApiOperation({ summary: 'Cadastra um preço manualmente (repassa ao MarketData).' })
  @ApiCreatedResponse({ type: PricePointDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiNotFoundResponse({ type: ProblemDto, description: 'Criptomoeda não acompanhada.' })
  @ApiConflictResponse({ type: ProblemDto, description: 'Já existe um preço neste instante.' })
  create(@AccessToken() accessToken: string, @Body() body: CreatePricePointDto): Promise<PricePointDto> {
    return this.createPricePoint.execute({ accessToken, data: body });
  }

  @Put('prices/:id')
  @ApiOperation({ summary: 'Altera o valor de um preço (repassa ao MarketData).' })
  @ApiOkResponse({ type: PricePointDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  update(
    @AccessToken() accessToken: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePricePointDto,
  ): Promise<PricePointDto> {
    return this.updatePricePoint.execute({ accessToken, id, data: body });
  }

  @Delete('prices/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui um preço (repassa ao MarketData).' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ProblemDto })
  delete(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deletePricePoint.execute({ accessToken, id });
  }
}
