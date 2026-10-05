import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AddUserCryptoHandler } from '../../application/features/add-user-crypto/add-user-crypto.handler';
import { GetUserCryptoHandler } from '../../application/features/get-user-crypto/get-user-crypto.handler';
import { ListUserCryptosHandler } from '../../application/features/list-user-cryptos/list-user-cryptos.handler';
import { RemoveUserCryptoHandler } from '../../application/features/remove-user-crypto/remove-user-crypto.handler';
import { UpdateUserCryptoHandler } from '../../application/features/update-user-crypto/update-user-crypto.handler';
import { AccessToken } from '../auth/access-token.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddUserCryptoDto, UpdateUserCryptoDto, UserCryptoDto } from '../dto/crypto.dto';
import { ProblemDto } from '../dto/problem.dto';

@ApiTags('UserCryptos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ type: ProblemDto })
@UseGuards(JwtAuthGuard)
@Controller('user-cryptos')
export class UserCryptosController {
  constructor(
    private readonly listUserCryptos: ListUserCryptosHandler,
    private readonly getUserCrypto: GetUserCryptoHandler,
    private readonly addUserCrypto: AddUserCryptoHandler,
    private readonly updateUserCrypto: UpdateUserCryptoHandler,
    private readonly removeUserCrypto: RemoveUserCryptoHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as criptomoedas monitoradas pelo usuário (repassa ao Catalog).' })
  @ApiOkResponse({ type: [UserCryptoDto] })
  list(@AccessToken() accessToken: string): Promise<UserCryptoDto[]> {
    return this.listUserCryptos.execute({ accessToken });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Devolve um item da lista do usuário (repassa ao Catalog).' })
  @ApiOkResponse({ type: UserCryptoDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  get(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<UserCryptoDto> {
    return this.getUserCrypto.execute({ accessToken, id });
  }

  @Post()
  @ApiOperation({ summary: 'Adiciona uma criptomoeda do catálogo à lista do usuário (repassa ao Catalog).' })
  @ApiCreatedResponse({ type: UserCryptoDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiNotFoundResponse({ type: ProblemDto, description: 'Criptomoeda fora do catálogo.' })
  @ApiConflictResponse({ type: ProblemDto, description: 'A criptomoeda já está na lista.' })
  add(@AccessToken() accessToken: string, @Body() body: AddUserCryptoDto): Promise<UserCryptoDto> {
    return this.addUserCrypto.execute({ accessToken, data: body });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Altera a anotação de um item da lista (repassa ao Catalog).' })
  @ApiOkResponse({ type: UserCryptoDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiNotFoundResponse({ type: ProblemDto })
  update(
    @AccessToken() accessToken: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserCryptoDto,
  ): Promise<UserCryptoDto> {
    return this.updateUserCrypto.execute({ accessToken, id, data: body });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um item da lista do usuário (repassa ao Catalog).' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ProblemDto })
  remove(@AccessToken() accessToken: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.removeUserCrypto.execute({ accessToken, id });
  }
}
