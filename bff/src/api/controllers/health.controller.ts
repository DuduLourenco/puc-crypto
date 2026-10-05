import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Indica que o BFF está no ar.' })
  @ApiOkResponse({ schema: { example: { status: 'Healthy' } } })
  get(): { status: string } {
    return { status: 'Healthy' };
  }
}
