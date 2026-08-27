import React, { useState } from 'react';
import {
  Search,
  Star,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { CryptoAsset } from '../../types/crypto.types';
import { formatBRL, formatPercent, formatMarketCap } from '../../utils/formatters';
import { Sparkline } from '../common/Sparkline';
import { Badge } from '../common/Badge';

interface CryptoTableProps {
  cryptos: CryptoAsset[];
  isLoading: boolean;
  watchlistCryptoIds: string[];
  onToggleWatchlist: (crypto: CryptoAsset) => void;
  onSelectCrypto?: (crypto: CryptoAsset) => void;
}

export const CryptoTable: React.FC<CryptoTableProps> = ({
  cryptos,
  isLoading,
  watchlistCryptoIds,
  onToggleWatchlist,
  onSelectCrypto,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtragem dos dados
  const filteredCryptos = cryptos.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="card" style={{ padding: '24px 24px 0 24px' }}>
      {/* Table Card Header: Title, Badges & Search Filter */}
      <div className="table-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h3 className="card-title-lg">Criptomoedas no Mercado</h3>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--gray-500)',
              backgroundColor: 'var(--gray-100)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 600,
            }}
          >
            {filteredCryptos.length} Ativos
          </span>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'layer1', label: 'Layer 1' },
              { id: 'defi', label: 'DeFi' },
              { id: 'stablecoin', label: 'Stablecoins' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  fontSize: '12px',
                  fontWeight: selectedCategory === cat.id ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor:
                    selectedCategory === cat.id ? 'var(--gray-900)' : 'var(--gray-100)',
                  color: selectedCategory === cat.id ? '#ffffff' : 'var(--gray-600)',
                  border: 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Field */}
          <div className="search-input-wrapper">
            <Search size={15} className="search-input-icon" />
            <input
              type="text"
              placeholder="Buscar criptomoeda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              id="input-busca-crypto"
            />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="crypto-table-container">
        <table className="crypto-table" aria-label="Tabela de Cotações">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Criptoativo</span>
                  <ArrowUpDown size={12} style={{ color: 'var(--gray-400)' }} />
                </div>
              </th>
              <th>Preço em Reais (BRL)</th>
              <th>Variação 24h</th>
              <th>Mín / Máx 24h</th>
              <th>Volume 24h (BRL)</th>
              <th>Cap. Mercado</th>
              <th>Tendência (7d)</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Favorito</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                    Carregando cotações em tempo real da API Azure...
                  </div>
                </td>
              </tr>
            ) : filteredCryptos.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px' }}>
                  <div style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                    Nenhuma criptomoeda encontrada para "{searchQuery}".
                  </div>
                </td>
              </tr>
            ) : (
              filteredCryptos.map((crypto) => {
                const isPositive = crypto.change24h >= 0;
                const isFavorite = watchlistCryptoIds.includes(crypto.id);

                return (
                  <tr
                    key={crypto.id}
                    onClick={() => onSelectCrypto && onSelectCrypto(crypto)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Rank */}
                    <td style={{ textAlign: 'center', color: 'var(--gray-500)', fontWeight: 600, fontSize: '12.5px' }}>
                      {crypto.rank}
                    </td>

                    {/* Crypto Asset Name & Symbol */}
                    <td>
                      <div className="asset-cell">
                        <img
                          src={crypto.iconUrl}
                          alt={crypto.name}
                          className="asset-icon"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="asset-name">{crypto.name}</div>
                          <div className="asset-symbol">
                            {crypto.symbol} • {crypto.category?.toUpperCase() || 'CRYPTO'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price in BRL */}
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '14px' }}>
                        {formatBRL(crypto.priceBrl)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td>
                      <Badge variant={isPositive ? 'success' : 'danger'}>
                        {isPositive ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {formatPercent(crypto.change24h)}
                      </Badge>
                    </td>

                    {/* 24h Range (Min / Max) */}
                    <td>
                      <div style={{ fontSize: '12.5px', color: 'var(--gray-700)' }}>
                        <div>{formatBRL(crypto.low24h)}</div>
                        <div style={{ color: 'var(--gray-400)', fontSize: '11px' }}>
                          a {formatBRL(crypto.high24h)}
                        </div>
                      </div>
                    </td>

                    {/* 24h Volume */}
                    <td>
                      <span style={{ color: 'var(--gray-700)', fontSize: '13px', fontWeight: 500 }}>
                        {formatMarketCap(crypto.volume24hBrl)}
                      </span>
                    </td>

                    {/* Market Cap */}
                    <td>
                      <span style={{ color: 'var(--gray-800)', fontSize: '13px', fontWeight: 600 }}>
                        {formatMarketCap(crypto.marketCapBrl)}
                      </span>
                    </td>

                    {/* Sparkline Chart */}
                    <td>
                      <Sparkline
                        data={crypto.sparkline7d}
                        isPositive={isPositive}
                        width={70}
                        height={20}
                      />
                    </td>

                    {/* Watchlist Bookmark Icon */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(crypto);
                        }}
                        className="icon-btn"
                        style={{
                          margin: '0 auto',
                          color: isFavorite ? '#ffc700' : 'var(--gray-400)',
                        }}
                        title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                      >
                        <Star
                          size={16}
                          fill={isFavorite ? '#ffc700' : 'transparent'}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
