import { CryptoAggregate } from './aggregated-data';

/** Uma linha do gráfico: um instante com o preço observado e/ou o previsto. */
export interface ChartRow {
  time: number;
  history: number | null;
  forecast: number | null;
  /** Limites inferior e superior do intervalo de 95% da previsão. */
  band: [number, number] | null;
}

export interface ForecastSummary {
  lastPriceUsd: number;
  finalPriceUsd: number;
  finalAt: string;
  changePercent: number;
}

/**
 * Junta histórico e previsão em uma única série de tempo. O último preço observado
 * também inicia a linha de previsão, para que as duas linhas se encontrem.
 */
export function buildChartRows(crypto: CryptoAggregate): ChartRow[] {
  const rows: ChartRow[] = crypto.history.map((point) => ({
    time: Date.parse(point.timestamp),
    history: point.priceUsd,
    forecast: null,
    band: null,
  }));

  const points = crypto.forecast?.points ?? [];

  if (rows.length > 0 && points.length > 0) {
    const last = rows[rows.length - 1];
    last.forecast = last.history;
    last.band = [last.history!, last.history!];
  }

  for (const point of points) {
    rows.push({
      time: Date.parse(point.timestamp),
      history: null,
      forecast: point.priceUsd,
      band: [point.lowerUsd, point.upperUsd],
    });
  }

  return rows;
}

/** Comparação entre o último preço observado e o último previsto. */
export function summarizeForecast(crypto: CryptoAggregate): ForecastSummary | null {
  const last = crypto.history[crypto.history.length - 1];
  const final = crypto.forecast?.points[crypto.forecast.points.length - 1];

  if (!last || !final || last.priceUsd === 0) {
    return null;
  }

  return {
    lastPriceUsd: last.priceUsd,
    finalPriceUsd: final.priceUsd,
    finalAt: final.timestamp,
    changePercent: Math.round(((final.priceUsd - last.priceUsd) / last.priceUsd) * 10000) / 100,
  };
}

export interface ValueAxis {
  domain: [number, number];
  ticks: number[];
}

/**
 * Eixo de valores com marcas em números redondos (passos de 1, 2 ou 5 vezes uma potência de 10),
 * cobrindo histórico, previsão e intervalo. Um eixo só para todas as séries.
 */
export function valueAxis(rows: readonly ChartRow[], targetTicks = 5): ValueAxis {
  const values = rows.flatMap((row) => [row.history, row.forecast, ...(row.band ?? [])]).filter((value): value is number => value !== null);

  if (values.length === 0) {
    return { domain: [0, 1], ticks: [0, 1] };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) || 1;

  const rawStep = span / Math.max(1, targetTicks - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? 10 * magnitude;

  const first = Math.max(0, Math.floor(min / step) * step);
  const last = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let index = 0; first + index * step <= last + step / 1e6; index++) {
    ticks.push(Number((first + index * step).toPrecision(12)));
  }

  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}
