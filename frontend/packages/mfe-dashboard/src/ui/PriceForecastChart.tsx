import { formatDate, formatDayMonth, formatUsd, formatUsdCompact } from '@puccrypto/shared';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartRow, valueAxis } from '../domain/chart-series';

const HISTORY = 'var(--pc-series-history)';
const FORECAST = 'var(--pc-series-forecast)';

interface Props {
  rows: ChartRow[];
  /** Descrição do gráfico para leitores de tela. */
  label: string;
}

/**
 * Preço ao longo do tempo: histórico (linha contínua) e previsão (linha tracejada, com a
 * faixa do intervalo de 95%). Um único eixo de valores; a legenda e o tracejado identificam
 * as séries além da cor; os valores também estão na tabela abaixo do gráfico.
 */
export function PriceForecastChart({ rows, label }: Props) {
  const axis = valueAxis(rows);
  const lastForecastIndex = rows.reduce((last, row, index) => (row.forecast !== null ? index : last), -1);

  return (
    <figure style={{ margin: 0, display: 'grid', gap: 8 }}>
      <ul className="dash-legend" aria-label="Legenda">
        <li>
          <LineKey color={HISTORY} /> Histórico
        </li>
        {lastForecastIndex >= 0 && (
          <>
            <li>
              <LineKey color={FORECAST} dashed /> Previsão
            </li>
            <li>
              <svg width="18" height="10" aria-hidden="true">
                <rect width="18" height="10" rx="2" fill={FORECAST} fillOpacity={0.18} />
              </svg>
              Intervalo de 95%
            </li>
          </>
        )}
      </ul>

      <div className="dash-chart" role="img" aria-label={label}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 84, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--pc-grid)" />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatDayMonth}
              tick={{ fill: 'var(--pc-text-muted)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--pc-axis)' }}
              minTickGap={48}
            />
            <YAxis
              domain={axis.domain}
              ticks={axis.ticks}
              tickFormatter={formatUsdCompact}
              tick={{ fill: 'var(--pc-text-muted)' }}
              tickLine={false}
              axisLine={false}
              width={88}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--pc-axis)', strokeWidth: 1 }} isAnimationActive={false} />

            <Area dataKey="band" stroke="none" fill={FORECAST} fillOpacity={0.1} isAnimationActive={false} activeDot={false} connectNulls={false} />
            <Line dataKey="history" stroke={HISTORY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dot={false} isAnimationActive={false} activeDot={{ r: 4, stroke: 'var(--pc-surface)', strokeWidth: 2 }} />
            <Line
              dataKey="forecast"
              stroke={FORECAST}
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: 'var(--pc-surface)', strokeWidth: 2 }}
              dot={(props: { index?: number; cx?: number; cy?: number; value?: number }) =>
                props.index === lastForecastIndex && props.cx != null && props.cy != null ? (
                  // Só o último ponto é marcado e rotulado: o valor previsto para o fim do período.
                  <g key="fim-da-previsao">
                    <circle cx={props.cx} cy={props.cy} r={5} fill={FORECAST} stroke="var(--pc-surface)" strokeWidth={2} />
                    <text x={props.cx + 10} y={props.cy} dy={4} fill="var(--pc-text)" fontWeight={600}>
                      {formatUsdCompact(props.value ?? 0)}
                    </text>
                  </g>
                ) : (
                  <g key={`sem-marcador-${props.index}`} />
                )
              }
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function LineKey({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <svg width="18" height="10" aria-hidden="true">
      <line x1="1" y1="5" x2="17" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? '5 4' : undefined} />
    </svg>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartRow }>;
}

/** Um único tooltip com todas as séries do instante apontado; o valor vem antes do nome. */
function ChartTooltip({ active, payload }: TooltipProps) {
  const row = payload?.[0]?.payload;

  if (!active || !row) {
    return null;
  }

  return (
    <div className="dash-tooltip">
      <div className="dash-tooltip__title">{formatDate(row.time)}</div>
      {row.history !== null && (
        <div className="dash-tooltip__row">
          <LineKey color={HISTORY} />
          <strong>{formatUsd(row.history)}</strong>
          <span>Histórico</span>
        </div>
      )}
      {row.forecast !== null && row.history === null && (
        <>
          <div className="dash-tooltip__row">
            <LineKey color={FORECAST} dashed />
            <strong>{formatUsd(row.forecast)}</strong>
            <span>Previsão</span>
          </div>
          {row.band && (
            <div className="dash-tooltip__row">
              <span>
                Intervalo de 95%: {formatUsd(row.band[0])} a {formatUsd(row.band[1])}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
