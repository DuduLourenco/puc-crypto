import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: 'ana@example.com' })
  email!: string;

  @ApiProperty({ example: 'senha-segura-1', minLength: 8 })
  password!: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'ana@example.com' })
  email!: string;

  @ApiProperty({ example: 'senha-segura-1' })
  password!: string;
}

export class RegisteredUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

export class AccessTokenDto {
  @ApiProperty({ description: 'JWT a enviar no cabeçalho Authorization das demais rotas.' })
  accessToken!: string;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;
}
