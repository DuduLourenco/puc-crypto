import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemFilter } from './filters/problem.filter';

/** Configuração HTTP comum à aplicação e aos testes: validação, formato de erro e Swagger. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new ProblemFilter());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('PucCrypto BFF')
      .setDescription(
        'Backend for Frontend do PucCrypto. Agrega os microsserviços Catalog e MarketData e a Azure Function ' +
          'de previsão em GET /aggregated-data, e repassa o login (Identity) e os CRUDs.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token obtido em POST /auth/login.' })
      .build(),
  );

  // Interface em /swagger e documento em /swagger/v1/swagger.json, como nos microsserviços.
  SwaggerModule.setup('swagger', app, document, { jsonDocumentUrl: 'swagger/v1/swagger.json' });
}
