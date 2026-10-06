import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { loadDashboard } from '../src/application/features/load-dashboard/load-dashboard';
import { AggregatedData, CryptoAggregate, selectCrypto } from '../src/domain/aggregated-data';
import { buildChartRows, summarizeForecast, valueAxis } from '../src/domain/chart-series';
import { DashboardPage } from '../src/ui/DashboardPage';

const day = (n: number) => new Date(Date.UTC(2026, 0, n)).toISOString();

function crypto(overrides: Partial<CryptoAggregate> = {}): CryptoAggregate {
  return {
    userCryptoId: 'u1',
    cryptocurrencyId: 'c1',
    symbol: 'BTC',
    name: 'Bitcoin',
    coinGeckoId: 'bitcoin',
    notes: null,
    latestPriceUsd: 110,
    latestPriceAt: day(3),
    historyStatus: 'ok',
    history: [
      { timestamp: day(1), priceUsd: 100 },
      { timestamp: day(2), priceUsd: 105 },
      { timestamp: day(3), priceUsd: 110 },
    ],
    periodChangePercent: 10,
    forecastStatus: 'ok',
    forecast: {
      model: 'modelo de teste',
      horizon: 2,
      points: [
        { timestamp: day(4), priceUsd: 115, lowerUsd: 110, upperUsd: 120 },
        { timestamp: day(5), priceUsd: 121, lowerUsd: 112, upperUsd: 130 },
      ],
    },
    ...overrides,
  };
}

describe('séries do gráfico (domínio)', () => {
  it('junta histórico e previsão, ligando as duas linhas no último preço observado', () => {
    const rows = buildChartRows(crypto());

    expect(rows).toHaveLength(5);
    expect(rows[1]).toEqual({ time: Date.parse(day(2)), history: 105, forecast: null, band: null });
    expect(rows[2]).toEqual({ time: Date.parse(day(3)), history: 110, forecast: 110, band: [110, 110] });
    expect(rows[4]).toEqual({ time: Date.parse(day(5)), history: null, forecast: 121, band: [112, 130] });
  });

  it('sem previsão, devolve só o histórico', () => {
    const rows = buildChartRows(crypto({ forecast: null, forecastStatus: 'unavailable' }));

    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.forecast === null && row.band === null)).toBe(true);
  });

  it('resume a previsão em relação ao último preço', () => {
    expect(summarizeForecast(crypto())).toEqual({ lastPriceUsd: 110, finalPriceUsd: 121, finalAt: day(5), changePercent: 10 });
    expect(summarizeForecast(crypto({ forecast: null }))).toBeNull();
  });

  it('o eixo de valores cobre o intervalo de confiança com marcas em números redondos', () => {
    const axis = valueAxis(buildChartRows(crypto()));

    expect(axis.ticks).toEqual([100, 110, 120, 130]);
    expect(axis.domain).toEqual([100, 130]);
  });

  it('o eixo usa passos de 1, 2 ou 5 e nunca começa abaixo de zero', () => {
    const rows = (values: number[]) => values.map((history, time) => ({ time, history, forecast: null, band: null }));

    expect(valueAxis(rows([51200, 65000])).ticks).toEqual([50000, 55000, 60000, 65000]);
    expect(valueAxis(rows([0.42, 0.57])).ticks).toEqual([0.4, 0.45, 0.5, 0.55, 0.6]);
    expect(valueAxis(rows([1, 9])).domain[0]).toBe(0);
    expect(valueAxis([]).domain).toEqual([0, 1]);
  });

  it('mantém a seleção e cai para a primeira moeda se a selecionada saiu da lista', () => {
    const cryptos = [crypto(), crypto({ userCryptoId: 'u2', symbol: 'ETH' })];

    expect(selectCrypto(cryptos, 'u2')?.symbol).toBe('ETH');
    expect(selectCrypto(cryptos, 'removida')?.symbol).toBe('BTC');
    expect(selectCrypto([], 'u1')).toBeNull();
  });
});

describe('loadDashboard', () => {
  it('pede ao BFF os dados agregados com os filtros', async () => {
    const data: AggregatedData = { generatedAt: day(5), cryptos: [] };
    const gateway = { getAggregatedData: vi.fn().mockResolvedValue(data) };

    await expect(loadDashboard(gateway, { horizon: 14, historyLimit: 30 })).resolves.toBe(data);
    expect(gateway.getAggregatedData).toHaveBeenCalledWith({ horizon: 14, historyLimit: 30 });
  });
});

describe('DashboardPage', () => {
  const data = (cryptos: CryptoAggregate[]): AggregatedData => ({ generatedAt: day(5), cryptos });

  it('mostra os números principais, o gráfico e a tabela da moeda selecionada', async () => {
    render(<DashboardPage load={vi.fn().mockResolvedValue(data([crypto()]))} />);

    expect(await screen.findByText('Último preço de Bitcoin')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Gráfico de linha do preço de Bitcoin/ })).toBeInTheDocument();
    expect(screen.getByText('Histórico', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText('Previsão', { selector: 'li' })).toBeInTheDocument();
    expect(screen.getByText(/Modelo: modelo de teste/)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(6);
  });

  it('troca de moeda pelas abas', async () => {
    render(<DashboardPage load={vi.fn().mockResolvedValue(data([crypto(), crypto({ userCryptoId: 'u2', symbol: 'ETH', name: 'Ethereum' })]))} />);

    await userEvent.click(await screen.findByRole('tab', { name: 'ETH' }));

    expect(screen.getByText('Último preço de Ethereum')).toBeInTheDocument();
  });

  it('recarrega com o novo horizonte de previsão', async () => {
    const load = vi.fn().mockResolvedValue(data([crypto()]));
    render(<DashboardPage load={load} />);

    await userEvent.selectOptions(await screen.findByLabelText('Previsão'), '30');

    expect(load).toHaveBeenLastCalledWith({ horizon: 30, historyLimit: 90 });
  });

  it('explica quando não há preços suficientes para prever', async () => {
    render(<DashboardPage load={vi.fn().mockResolvedValue(data([crypto({ forecast: null, forecastStatus: 'insufficient-history' })]))} />);

    expect(await screen.findByText(/não há preços suficientes para prever/)).toBeInTheDocument();
  });

  it('explica quando a previsão está indisponível e mantém o histórico', async () => {
    render(<DashboardPage load={vi.fn().mockResolvedValue(data([crypto({ forecast: null, forecastStatus: 'unavailable' })]))} />);

    expect(await screen.findByText(/previsão não está disponível/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Gráfico de linha/ })).toBeInTheDocument();
  });

  it('com a lista vazia, aponta para a tela de criptomoedas', async () => {
    render(<DashboardPage load={vi.fn().mockResolvedValue(data([]))} />);

    expect(await screen.findByRole('link', { name: 'Ir para Criptomoedas' })).toHaveAttribute('href', '/criptomoedas');
  });

  it('mostra o erro quando o BFF falha', async () => {
    render(<DashboardPage load={vi.fn().mockRejectedValue(new Error('O serviço Catalog não respondeu.'))} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('O serviço Catalog não respondeu.');
  });
});
