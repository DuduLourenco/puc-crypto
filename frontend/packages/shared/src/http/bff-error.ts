/** Erro devolvido pelo BFF no formato Problem Details, ou falha ao alcançá-lo (status 0). */
export class BffError extends Error {
  constructor(
    readonly status: number,
    /** Código do erro, por exemplo "Catalog.CryptoInUse". */
    readonly title: string,
    readonly detail: string,
    /** Erros de validação por campo, quando o serviço os informa. */
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(detail || title);
    this.name = 'BffError';
  }

  /** Mensagem para mostrar ao usuário. */
  get userMessage(): string {
    const fields = Object.values(this.fieldErrors).flat();

    if (fields.length > 0) {
      return fields.join(' ');
    }

    return this.detail || this.title || 'Não foi possível concluir a operação.';
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof BffError) {
    return error.userMessage;
  }

  return error instanceof Error ? error.message : 'Erro inesperado.';
}
