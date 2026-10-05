import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginUserHandler } from '../../application/features/login-user/login-user.handler';
import { RegisterUserHandler } from '../../application/features/register-user/register-user.handler';
import { AccessTokenDto, LoginUserDto, RegisterUserDto, RegisteredUserDto } from '../dto/auth.dto';
import { ProblemDto } from '../dto/problem.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserHandler,
    private readonly loginUser: LoginUserHandler,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastra um usuário (repassa ao Identity).' })
  @ApiCreatedResponse({ type: RegisteredUserDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiConflictResponse({ type: ProblemDto, description: 'E-mail já cadastrado.' })
  register(@Body() body: RegisterUserDto): Promise<RegisteredUserDto> {
    return this.registerUser.execute({ data: body });
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autentica um usuário e devolve o token de acesso (repassa ao Identity).' })
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiBadRequestResponse({ type: ProblemDto })
  @ApiUnauthorizedResponse({ type: ProblemDto, description: 'Credenciais inválidas.' })
  login(@Body() body: LoginUserDto): Promise<AccessTokenDto> {
    return this.loginUser.execute({ data: body });
  }
}
