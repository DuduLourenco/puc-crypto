/** Nome do serviço chamado pelo BFF, usado nas mensagens de erro. */
export type UpstreamService = 'Identity' | 'Catalog' | 'MarketData' | 'Forecast';

/**
 * O serviço respondeu com um erro (4xx ou 5xx). O status e o corpo (Problem Details)
 * são repassados ao cliente do BFF.
 */
export class UpstreamError extends Error {
  constructor(
    readonly service: UpstreamService,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`${service} respondeu ${status}`);
    this.name = 'UpstreamError';
  }
}

/** O serviço não respondeu: falha de rede, tempo esgotado ou resposta ilegível. */
export class UpstreamUnavailableError extends Error {
  constructor(
    readonly service: UpstreamService,
    cause?: unknown,
  ) {
    super(`${service} não respondeu`, { cause });
    this.name = 'UpstreamUnavailableError';
  }
}

export function isUpstreamFailure(error: unknown): error is UpstreamError | UpstreamUnavailableError {
  return error instanceof UpstreamError || error instanceof UpstreamUnavailableError;
}
