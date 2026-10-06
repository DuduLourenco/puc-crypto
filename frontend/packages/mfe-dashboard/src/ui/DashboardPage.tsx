import { ErrorMessage, Loading, formatDateTime } from '@puccrypto/shared';
import { useCallback, useEffect, useState } from 'react';
import {
  AggregatedData,
  DEFAULT_FILTERS,
  DashboardFilters,
  HISTORY_OPTIONS,
  HORIZON_OPTIONS,
  selectCrypto,
} from '../domain/aggregated-data';
import { CryptoDetail } from './CryptoDetail';
import './dashboard.css';

interface Props {
  load: (filters: DashboardFilters) => Promise<AggregatedData>;
  /** Caminho da tela de criptomoedas no shell, para o caso de a lista estar vazia. */
  cryptosPath?: string;
}

/** Dashboard: uma chamada ao BFF traz a lista do usuário, o histórico e a previsão. */
export function DashboardPage({ load, cryptosPath = '/criptomoedas' }: Props) {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [data, setData] = useState<AggregatedData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(
    async (current: DashboardFilters) => {
      setLoading(true);
      try {
        setData(await load(current));
        setError(null);
      } catch (caught) {
        setError(caught);
      } finally {
        setLoading(false);
      }
    },
    [load],
  );

  useEffect(() => {
    void refresh(filters);
  }, [refresh, filters]);

  const selected = data ? selectCrypto(data.cryptos, selectedId) : null;

  return (
    <div className="pc-page">
      <header className="pc-page__header">
        <div>
          <h1>Dashboard</h1>
          <p className="pc-subtitle">Histórico de preços e previsão das criptomoedas da sua lista.</p>
        </div>
        {data && <span className="pc-muted">Atualizado em {formatDateTime(data.generatedAt)}</span>}
      </header>

      <div className="dash-filters">
        <label className="pc-field">
          <span>Histórico</span>
          <select className="pc-select" value={filters.historyLimit} onChange={(event) => setFilters({ ...filters, historyLimit: Number(event.target.value) })}>
            {HISTORY_OPTIONS.map((days) => (
              <option key={days} value={days}>
                Últimos {days} preços
              </option>
            ))}
          </select>
        </label>
        <label className="pc-field">
          <span>Previsão</span>
          <select className="pc-select" value={filters.horizon} onChange={(event) => setFilters({ ...filters, horizon: Number(event.target.value) })}>
            {HORIZON_OPTIONS.map((days) => (
              <option key={days} value={days}>
                Próximos {days} dias
              </option>
            ))}
          </select>
        </label>
        <button className="pc-button pc-button--ghost" type="button" disabled={loading} onClick={() => void refresh(filters)}>
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      <ErrorMessage error={error} />

      {!data && loading && <Loading label="Carregando o dashboard…" />}

      {data && data.cryptos.length === 0 && (
        <section className="pc-card">
          <h2>Sua lista está vazia</h2>
          <p className="pc-subtitle">Adicione criptomoedas à sua lista para acompanhar o histórico de preços e a previsão.</p>
          <div>
            <a className="pc-button" href={cryptosPath} style={{ textDecoration: 'none', display: 'inline-block' }}>
              Ir para Criptomoedas
            </a>
          </div>
        </section>
      )}

      {data && selected && (
        <div className="dash-content" aria-busy={loading}>
          <div className="pc-tabs" role="tablist" aria-label="Criptomoedas da sua lista">
            {data.cryptos.map((crypto) => (
              <button
                key={crypto.userCryptoId}
                type="button"
                role="tab"
                className="pc-tab"
                aria-selected={crypto.userCryptoId === selected.userCryptoId}
                onClick={() => setSelectedId(crypto.userCryptoId)}
              >
                {crypto.symbol}
              </button>
            ))}
          </div>

          <CryptoDetail crypto={selected} />
        </div>
      )}
    </div>
  );
}
