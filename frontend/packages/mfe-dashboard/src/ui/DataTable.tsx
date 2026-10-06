import { formatDate, formatUsd } from '@puccrypto/shared';
import { ChartRow } from '../domain/chart-series';

/** Visão em tabela dos mesmos dados do gráfico, para quem não pode ou não quer usá-lo. */
export function DataTable({ rows }: { rows: ChartRow[] }) {
  // Do mais recente ao mais antigo: a previsão primeiro, depois o histórico.
  const ordered = [...rows].reverse();

  return (
    <details className="dash-details">
      <summary>Ver os dados em tabela</summary>
      <div className="pc-table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
        <table className="pc-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th className="pc-num">Preço</th>
              <th className="pc-num">Intervalo de 95%</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => {
              const isForecast = row.history === null;

              return (
                <tr key={`${row.time}-${isForecast}`}>
                  <td>{formatDate(row.time)}</td>
                  <td>{isForecast ? 'Previsão' : 'Histórico'}</td>
                  <td className="pc-num">{formatUsd(isForecast ? row.forecast : row.history)}</td>
                  <td className="pc-num">{isForecast && row.band ? `${formatUsd(row.band[0])} a ${formatUsd(row.band[1])}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
