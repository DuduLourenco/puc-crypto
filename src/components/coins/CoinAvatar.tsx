import React from 'react';
import { CustomCoin } from '../../types/coin.types';
import { getPresetById } from './coinIconPresets';

interface CoinAvatarProps {
  coin: Pick<CustomCoin, 'name' | 'symbol' | 'iconSource' | 'iconPresetId' | 'iconDataUrl'>;
  size?: number;
}

/**
 * Renderiza o ícone da moeda: SVG colorido padrão ou o PNG enviado pelo usuário
 */
export const CoinAvatar: React.FC<CoinAvatarProps> = ({ coin, size = 40 }) => {
  if (coin.iconSource === 'upload' && coin.iconDataUrl) {
    return (
      <img
        src={coin.iconDataUrl}
        alt={`Ícone de ${coin.name || coin.symbol}`}
        className="coin-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  const preset = getPresetById(coin.iconPresetId);
  if (preset) {
    return <preset.Icon size={size} />;
  }

  return (
    <div
      className="coin-avatar-fallback"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {(coin.symbol || coin.name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
};
