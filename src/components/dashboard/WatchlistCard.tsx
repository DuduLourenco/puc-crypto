import React, { useState } from 'react';
import { Trash2, Plus, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { UserWatchlistItem } from '../../types/user.types';
import { CryptoAsset } from '../../types/crypto.types';
import { formatBRL, formatPercent } from '../../utils/formatters';

interface WatchlistCardProps {
  watchlist: UserWatchlistItem[];
  availableCryptos: CryptoAsset[];
  onAddCryptoToWatchlist: (crypto: CryptoAsset) => void;
  onRemoveFromWatchlist: (id: string) => void;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({
  watchlist,
  availableCryptos,
  onAddCryptoToWatchlist,
  onRemoveFromWatchlist,
}) => {
  const [selectedCryptoId, setSelectedCryptoId] = useState<string>(
    availableCryptos[0]?.id || ''
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const crypto = availableCryptos.find((c) => c.id === selectedCryptoId);
    if (!crypto) return;
    onAddCryptoToWatchlist(crypto);
  };

  return (
    <div className="card side-card">
      {/* Header */}
      <div className="card-header-simple">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <Star size={16} fill="#FFC700" stroke="#FFC700" style={{ flexShrink: 0 }} />
          <h3 className="card-title-lg" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Criptos Favoritas
          </h3>
        </div>
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '2px 8px',
            borderRadius: '10px',
            flexShrink: 0,
          }}
        >
          {watchlist.length}
        </span>
      </div>

      {/* Description */}
      <p className="side-card-desc">
        Acompanhe seus criptoativos prioritários e variações em tempo real no painel.
      </p>

      {/* Form Input + Add Button */}
      <form onSubmit={handleAdd} className="input-action-group">
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <select
            value={selectedCryptoId || (availableCryptos[0]?.id ?? '')}
            onChange={(e) => setSelectedCryptoId(e.target.value)}
            className="input-action-field"
            id="select-add-watchlist"
            style={{ width: '100%', textOverflow: 'ellipsis' }}
          >
            {availableCryptos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol}) - {formatBRL(c.priceBrl)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '13px', flexShrink: 0 }}
        >
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>

      {/* Watchlist Items list */}
      <div className="watchlist-items-list">
        {watchlist.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 12px',
              color: 'var(--gray-500)',
              fontSize: '13px',
              backgroundColor: 'var(--gray-100)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--gray-300)',
            }}
          >
            Nenhuma criptomoeda favoritada ainda.
          </div>
        ) : (
          watchlist.map((item) => {
            const matchedCrypto = availableCryptos.find(
              (c) => c.id === item.cryptoId || c.symbol === item.symbol
            );
            const price = matchedCrypto?.priceBrl;
            const change = matchedCrypto?.change24h;
            const isPositive = (change ?? 0) >= 0;

            return (
              <div key={item.id} className="watchlist-item">
                <div className="watchlist-item-user">
                  <img
                    src={
                      item.iconUrl ||
                      matchedCrypto?.iconUrl ||
                      'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
                    }
                    alt={item.name}
                    className="watchlist-item-avatar"
                  />
                  <div className="watchlist-item-text-col">
                    <div className="watchlist-item-name" title={item.name}>
                      {item.name}
                    </div>
                    <div className="watchlist-item-sub">
                      {price ? formatBRL(price) : 'BRL'}
                      {change !== undefined && (
                        <span
                          className={`watchlist-badge-change ${
                            isPositive ? 'positive' : 'negative'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp size={10} strokeWidth={2.5} />
                          ) : (
                            <TrendingDown size={10} strokeWidth={2.5} />
                          )}
                          {formatPercent(change)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trash/Remove Button */}
                <button
                  className="icon-action-btn"
                  onClick={() => onRemoveFromWatchlist(item.id)}
                  title="Remover dos favoritos"
                  aria-label="Remover favorito"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
