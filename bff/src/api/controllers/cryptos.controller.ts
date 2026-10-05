import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateCryptoHandler } from '../../application/features/create-crypto/create-crypto.handler';
import { DeleteCryptoHandler } from '../../application/features/delete-crypto/delete-crypto.handler';
import { GetCryptoHandler } from '../../application/features/get-crypto/get-crypto.handler';
import { ListCryptosHandler } from '../../application/features/list-cryptos/list-cryptos.handler';
import { UpdateCryptoHandler } from '../../application/features/update-crypto/update-crypto.handler';
import { AccessToken } from '../auth/access-token.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCryptoDto, CryptoDto, UpdateCryptoDto } from '../dto/crypto.dto';
import { ProblemDto } from '../dto/problem.dto';

@ApiTags('Cryptos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ProblemDto })
@UseGuards(JwtAuthGuard)
@Controller('cryptos')
export class CryptosController {
  constructor(
    private readonly listCryptos: ListCryptosHandler,
    private readonly getCrypto: GetCryptoHandler,
    private readonly createCrypto: CreateCryptoHandler,
    private readonly updateCrypto: UpdateCryptoHandler,
    private readonly deleteCrypto: DeleteCryptoHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista o catálogo de criptomoedas (repassa ao Catalog).' })
  @ApiOkResponse({ type: [CryptoDto] })
  list(@AccessToken() accessToken: string): Promise<CryptoDto[]> {
    return this.listCryptos.execute({ accessToken });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Devolve uma criptomoeda do catálogo (repassa ao Catalog).' })
  @ApiOkResponse({ type: CryptoDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  get(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<CryptoDto> {
    return this.getCrypto.execute({ accessToken, id });
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra uma criptomoeda no catálogo (repassa ao Catalog).' })
  @ApiCreatedResponse({ type: CryptoDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiConflictResponse({ type: ProblemDto, description: 'Identificador da CoinGecko já cadastrado.' })
  create(@AccessToken() accessToken: string, @Body() body: CreateCryptoDto): Promise<CryptoDto> {
    return this.createCrypto.execute({ accessToken, data: body });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Altera símbolo e nome de uma criptomoeda (repassa ao Catalog).' })
  @ApiOkResponse({ type: CryptoDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  update(
    @AccessToken() accessToken: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCryptoDto,
  ): Promise<CryptoDto> {
    return this.updateCrypto.execute({ accessToken, id, data: body });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui uma criptomoeda do catálogo (repassa ao Catalog).' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ProblemDto })
  @ApiConflictResponse({ type: ProblemDto, description: 'A criptomoeda está na lista de algum usuário.' })
  delete(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteCrypto.execute({ accessToken, id });
  }
}
