export interface GetAggregatedDataQuery {
  accessToken: string;
  /** Quantos passos prever para cada criptomoeda. */
  horizon?: number;
  /** Quantos preços do histórico buscar para cada criptomoeda. */
  historyLimit?: number;
}
