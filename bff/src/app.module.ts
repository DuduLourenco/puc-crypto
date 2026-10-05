import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

/** Raiz de composição: junta a camada API aos adaptadores da Infrastructure. */
@Module({
  imports: [InfrastructureModule, ApiModule],
})
export class AppModule {}
