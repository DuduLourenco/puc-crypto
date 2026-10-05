import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { UpstreamError, UpstreamUnavailableError } from '../../application/errors/upstream.errors';

/**
 * Padroniza as respostas de erro no formato Problem Details (title, status, detail):
 * - erro devolvido por um serviço: mesmo status e mesmo corpo;
 * - serviço que não respondeu: 502;
 * - erros do próprio BFF (autenticação, validação, rota inexistente): status do Nest.
 */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof UpstreamError) {
      const body =
        exception.body && typeof exception.body === 'object'
          ? exception.body
          : { title: `Bff.${exception.service}Error`, status: exception.status, detail: exception.body ?? undefined };

      response.status(exception.status).type('application/problem+json').json(body);
      return;
    }

    if (exception instanceof UpstreamUnavailableError) {
      this.logger.warn(`${exception.message}: ${String(exception.cause ?? '')}`);
      this.send(response, HttpStatus.BAD_GATEWAY, 'Bff.UpstreamUnavailable', `O serviço ${exception.service} não respondeu.`);
      return;
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const message = typeof payload === 'object' && payload !== null ? (payload as { message?: unknown }).message : payload;
      const detail = Array.isArray(message) ? message.join('; ') : String(message ?? exception.message);

      this.send(response, exception.getStatus(), `Bff.${exception.name.replace(/Exception$/, '')}`, detail);
      return;
    }

    this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    this.send(response, HttpStatus.INTERNAL_SERVER_ERROR, 'Bff.InternalError', 'Erro inesperado no BFF.');
  }

  private send(response: Response, status: number, title: string, detail: string): void {
    response.status(status).type('application/problem+json').json({ title, status, detail });
  }
}
