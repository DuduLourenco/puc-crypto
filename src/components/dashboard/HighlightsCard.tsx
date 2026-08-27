import React from 'react';
import {
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
} from 'lucide-react';
import { MarketOverview, CryptoAsset } from '../../types/crypto.types';
import { formatBRL, formatPercent, formatMarketCap } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface HighlightsCardProps {
  marketOverview?: MarketOverview;
  topCryptos: CryptoAsset[];
  onSelectCrypto: (crypto: CryptoAsset) => void;
}

export const HighlightsCard: React.FC<HighlightsCardProps> = ({
  marketOverview,
  topCryptos,
  onSelectCrypto,
}) => {
  const totalMarketCap = marketOverview?.totalMarketCapBrl ?? 14850000000000;
  const marketChange = marketOverview?.marketChange24h ?? 2.7;

  // Segmentos de dominância de mercado
  const dominanceSegments = [
    { name: 'Bitcoin', symbol: 'BTC', percentage: marketOverview?.btcDominancePercent ?? 57.2, color: '#17C653' },
    { name: 'Ethereum', symbol: 'ETH', percentage: marketOverview?.ethDominancePercent ?? 18.4, color: '#F8285A' },
    { name: 'Solana', symbol: 'SOL', percentage: marketOverview?.solDominancePercent ?? 8.5, color: '#7239EA' },
  ];

  // Principais ativos em destaque
  const previewItems = topCryptos.slice(0, 5);

  return (
    <div className="card highlights-card">
      {/* Header */}
      <div className="card-header-simple">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="card-title-lg">Destaques do Mercado</h3>
        </div>
        <button className="icon-btn" title="Opções" style={{ width: '28px', height: '28px' }}>
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Market Cap Metric */}
      <div className="highlights-balance-label">Capitalização Global de Mercado (BRL)</div>
      <div className="highlights-balance-row">
        <span className="highlights-balance-value">
          {formatMarketCap(totalMarketCap)}
        </span>
        <Badge variant={marketChange >= 0 ? 'success' : 'danger'}>
          {formatPercent(marketChange)}
        </Badge>
      </div>

      {/* Market Dominance Bar matching design in screenshot */}
      <div className="distribution-bar">
        {dominanceSegments.map((item) => (
          <div
            key={item.symbol}
            className="distribution-segment"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            title={`Dominância ${item.name}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Dominance Legend */}
      <div className="distribution-legend">
        {dominanceSegments.map((item) => (
          <div key={item.symbol} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: item.color }}
            />
            <span>
              {item.name} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown Items List */}
      <div className="breakdown-list">
        {previewItems.map((crypto) => {
          const isUp = crypto.change24h >= 0;
          return (
            <div
              key={crypto.id}
              className="breakdown-item"
              onClick={() => onSelectCrypto(crypto)}
              style={{ cursor: 'pointer' }}
              title="Clique para ver cotação"
            >
              <div className="breakdown-item-left">
                <img
                  src={crypto.iconUrl}
                  alt={crypto.name}
                  style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                />
                <span className="breakdown-item-name">
                  {crypto.name} ({crypto.symbol})
                </span>
              </div>
              <div className="breakdown-item-right">
                <span className="breakdown-item-val">
                  {formatBRL(crypto.priceBrl)}
                </span>
                <span
                  className={`breakdown-item-change ${
                    isUp ? 'change-up' : 'change-down'
                  }`}
                >
                  {isUp ? (
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={13} strokeWidth={2.5} />
                  )}
                  {formatPercent(crypto.change24h)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
