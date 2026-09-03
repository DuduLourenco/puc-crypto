/**
 * Origem do ícone escolhido para a moeda cadastrada
 */
export type CoinIconSource = 'preset' | 'upload';

/**
 * Modelo de uma moeda cadastrada manualmente pelo usuário
 */
export interface CustomCoin {
  id: string;
  name: string;
  symbol: string;
  iconSource: CoinIconSource;
  /** Identificador do ícone padrão (quando iconSource === 'preset') */
  iconPresetId?: string;
  /** PNG enviado pelo usuário em base64 (quando iconSource === 'upload') */
  iconDataUrl?: string;
  /** Nome original do arquivo enviado, exibido na listagem */
  iconFileName?: string;
  createdAt: string;
}

/**
 * Dados do formulário de cadastro antes da persistência
 */
export interface CustomCoinInput {
  name: string;
  symbol: string;
  iconSource: CoinIconSource;
  iconPresetId?: string;
  iconDataUrl?: string;
  iconFileName?: string;
}
