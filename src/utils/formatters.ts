/**
 * Utilitários de formatação de valores monetários, percentuais e números
 */

/**
 * Formata um valor numérico para o padrão de moeda Brasileira (BRL / R$)
 */
export function formatBRL(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: value < 10 ? 2 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

/**
 * Formata valor de variação percentual com sinal (+ ou -)
 */
export function formatPercent(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

/**
 * Formata volume ou capitalização de forma enxuta (ex: R$ 6.89 T)
 */
export function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `R$ ${(value / 1_000_000_000_000).toFixed(2)} Tri`;
  }
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(2)} Bi`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2)} Mi`;
  }
  return formatBRL(value);
}
