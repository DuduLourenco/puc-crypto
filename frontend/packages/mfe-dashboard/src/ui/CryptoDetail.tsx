import { InfoMessage, formatDate, formatDateTime, formatPercent, formatUsd } from '@puccrypto/shared';
import { CryptoAggregate } from '../domain/aggregated-data';
import { buildChartRows, summarizeForecast } from '../domain/chart-series';
import { DataTable } from './DataTable';
import { PriceForecastChart } from './PriceForecastChart';

/** Números principais, gráfico e tabela de uma criptomoeda da lista do usuário. */
export function CryptoDetail({ crypto }: { crypto: CryptoAggregate }) {
  const rows = buildChartRows(crypto);
  const summary = summarizeForecast(crypto);
  const lastPrice = crypto.history[crypto.history.length - 1]?.priceUsd ?? crypto.latestPriceUsd;

  return (
    <>
      <div className="dash-tiles">
        <div className="pc-card dash-tile">
          <span className="dash-tile__label">Último preço de {crypto.name}</span>
          <span className="dash-tile__value dash-tile__value--hero">{formatUsd(lastPrice)}</span>
          <span className="dash-tile__note">{crypto.latestPriceAt ? `Atualizado em ${formatDateTime(crypto.latestPriceAt)}` : 'Ainda sem coleta de preço'}</span>
        </div>

        <div className="pc-card dash-tile">
          <span className="dash-tile__label">Variação no período</span>
          <span className="dash-tile__value">
            <Delta value={crypto.periodChangePercent} />
          </span>
          <span className="dash-tile__note">
            {crypto.history.length > 1 ? `Desde ${formatDate(crypto.history[0].timestamp)} (${crypto.history.length} preços)` : 'Histórico insuficiente'}
          </span>
        </div>

        <div className="pc-card dash-tile">
          <span className="dash-tile__label">Previsão para {summary ? formatDate(summary.finalAt) : 'os próximos dias'}</span>
          <span className="dash-tile__value">{summary ? formatUsd(summary.finalPriceUsd) : '—'}</span>
          <span className="dash-tile__note">{summary ? <Delta value={summary.changePercent} suffix=" em relação ao último preço" /> : 'Sem previsão disponível'}</span>
        </div>
      </div>

      {crypto.historyStatus === 'unavailable' && <InfoMessage>O histórico de preços não está disponível no momento. Tente atualizar em instantes.</InfoMessage>}
      {crypto.historyStatus === 'ok' && crypto.forecastStatus === 'insufficient-history' && (
        <InfoMessage>
          Ainda não há preços suficientes para prever. São necessários pelo menos 14; esta moeda tem {crypto.history.length}.
        </InfoMessage>
      )}
      {crypto.historyStatus === 'ok' && crypto.forecastStatus === 'unavailable' && (
        <InfoMessage>A previsão não está disponível no momento; o gráfico mostra apenas o histórico.</InfoMessage>
      )}

      {rows.length > 1 ? (
        <section className="pc-card" aria-labelledby="chart-title">
          <div>
            <h2 id="chart-title">Preço de {crypto.name} em dólar</h2>
            <p className="pc-muted">
              {crypto.forecast ? `Histórico e previsão de ${crypto.forecast.horizon} dias. Modelo: ${crypto.forecast.model}.` : 'Histórico de preços.'}
            </p>
          </div>
          <PriceForecastChart rows={rows} label={`Gráfico de linha do preço de ${crypto.name} em dólar ao longo do tempo${crypto.forecast ? ', com a previsão' : ''}.`} />
          <DataTable rows={rows} />
        </section>
      ) : (
        crypto.historyStatus === 'ok' && <InfoMessage>Ainda não há histórico de preços para mostrar no gráfico.</InfoMessage>
      )}
    </>
  );
}

/** Variação com seta e sinal; a cor só reforça a direção. */
function Delta({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value == null) {
    return <>—</>;
  }

  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const arrow = { up: '▲', down: '▼', flat: '■' }[direction];

  return (
    <>
      <span className={`dash-delta dash-delta--${direction}`}>
        <span aria-hidden="true">{arrow}</span> {formatPercent(value)}
      </span>
      {suffix}
    </>
  );
}
