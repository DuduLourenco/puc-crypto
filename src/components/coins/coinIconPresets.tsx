import React from 'react';

/**
 * Ícones padrão de criptomoedas desenhados em SVG com as cores reais de cada marca.
 * Ficam embutidos no bundle (sem requisição de rede) e escalam sem perder qualidade.
 */

interface IconProps {
  size?: number;
}

/** Base circular colorida usada pelos ícones baseados em glifo */
const GlyphCoin: React.FC<
  IconProps & { color: string; glyph: string; fontSize?: number; textColor?: string }
> = ({ size = 32, color, glyph, fontSize = 19, textColor = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill={color} />
    <text
      x="16"
      y="16.5"
      textAnchor="middle"
      dominantBaseline="central"
      fill={textColor}
      fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
      fontSize={fontSize}
      fontWeight={700}
    >
      {glyph}
    </text>
  </svg>
);

const BitcoinIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#F7931A" glyph="₿" fontSize={20} />
);

const EthereumIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <g fill="#fff" fillRule="nonzero">
      <path fillOpacity=".6" d="M16.5 4v8.87l7.5 3.35z" />
      <path d="M16.5 4L9 16.22l7.5-3.35z" />
      <path fillOpacity=".6" d="M16.5 21.97V28L24 17.62z" />
      <path d="M16.5 28v-6.03L9 17.62z" />
      <path fillOpacity=".2" d="M16.5 20.57L24 16.22l-7.5-3.35z" />
      <path fillOpacity=".6" d="M9 16.22l7.5 4.35v-7.7z" />
    </g>
  </svg>
);

const TetherIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#26A17B" glyph="₮" fontSize={19} />
);

const BnbIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
    <path
      fill="#fff"
      d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"
    />
  </svg>
);

const SolanaIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <defs>
      <linearGradient id="sol-brand-gradient" x1="4" y1="26" x2="28" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#9945FF" />
        <stop offset="1" stopColor="#14F195" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="16" fill="#131313" />
    <g fill="url(#sol-brand-gradient)">
      <path d="M9.9 20.4a.6.6 0 01.42-.17h13.2c.27 0 .4.32.21.5l-2.6 2.6a.6.6 0 01-.42.17H7.5a.3.3 0 01-.21-.5l2.6-2.6z" />
      <path d="M9.9 8.5a.6.6 0 01.42-.17h13.2c.27 0 .4.32.21.5l-2.6 2.6a.6.6 0 01-.42.18H7.5a.3.3 0 01-.21-.51l2.6-2.6z" />
      <path d="M21.13 14.42a.6.6 0 00-.42-.17H7.5a.3.3 0 00-.21.5l2.6 2.6a.6.6 0 00.42.18h13.2a.3.3 0 00.21-.51l-2.6-2.6z" />
    </g>
  </svg>
);

const XrpIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#23292F" />
    <path
      fill="#fff"
      d="M23.07 8h3.02l-6.28 6.22a5.44 5.44 0 01-7.62 0L5.9 8h3.03l4.76 4.72a3.3 3.3 0 004.62 0L23.07 8zM8.89 24.4H5.86l6.32-6.26a5.44 5.44 0 017.62 0l6.32 6.26h-3.02l-4.81-4.76a3.3 3.3 0 00-4.62 0L8.9 24.4z"
    />
  </svg>
);

const CardanoIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#0033AD" />
    <g fill="#fff">
      <circle cx="16" cy="16" r="2.2" />
      <circle cx="16" cy="8.4" r="1.5" />
      <circle cx="16" cy="23.6" r="1.5" />
      <circle cx="9.4" cy="12.2" r="1.5" />
      <circle cx="22.6" cy="12.2" r="1.5" />
      <circle cx="9.4" cy="19.8" r="1.5" />
      <circle cx="22.6" cy="19.8" r="1.5" />
      <circle cx="16" cy="4.6" r="1" opacity=".85" />
      <circle cx="16" cy="27.4" r="1" opacity=".85" />
      <circle cx="6.1" cy="10.3" r="1" opacity=".85" />
      <circle cx="25.9" cy="10.3" r="1" opacity=".85" />
      <circle cx="6.1" cy="21.7" r="1" opacity=".85" />
      <circle cx="25.9" cy="21.7" r="1" opacity=".85" />
    </g>
  </svg>
);

const DogecoinIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#C2A633" glyph="Ð" fontSize={18} />
);

const PolkadotIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#E6007A" />
    <g fill="#fff">
      <circle cx="16" cy="16" r="2.3" />
      <ellipse cx="16" cy="8.5" rx="3.4" ry="2.05" />
      <ellipse cx="16" cy="23.5" rx="3.4" ry="2.05" />
      <ellipse cx="9.5" cy="12.25" rx="3.4" ry="2.05" transform="rotate(-60 9.5 12.25)" />
      <ellipse cx="22.5" cy="19.75" rx="3.4" ry="2.05" transform="rotate(-60 22.5 19.75)" />
      <ellipse cx="9.5" cy="19.75" rx="3.4" ry="2.05" transform="rotate(60 9.5 19.75)" />
      <ellipse cx="22.5" cy="12.25" rx="3.4" ry="2.05" transform="rotate(60 22.5 12.25)" />
    </g>
  </svg>
);

const ChainlinkIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#2A5ADA" />
    <path fill="#fff" d="M16 6.4l-2.36 1.37-6.42 3.72-2.36 1.37v6.28l2.36 1.37 6.48 3.72 2.36 1.37 2.36-1.37 6.36-3.72 2.36-1.37v-6.28l-2.36-1.37-6.42-3.72L16 6.4zm-6.42 12.74v-6.28L16 9.72l6.42 3.14v6.28L16 22.28l-6.42-3.14z" />
  </svg>
);

const LitecoinIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#345D9D" glyph="Ł" fontSize={19} />
);

const AvalancheIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#E84142" />
    <g fill="#fff">
      <path d="M19.5 8l7.5 15H12z" />
      <path d="M8.45 16l3.35 7H5.1z" />
    </g>
  </svg>
);

const PolygonIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#8247E5" />
    <path
      fill="#fff"
      d="M21.09 12.36a1.2 1.2 0 00-1.16 0l-2.7 1.6-1.84 1.04-2.68 1.6a1.2 1.2 0 01-1.16 0l-2.12-1.26a1.2 1.2 0 01-.58-1.01v-2.46c0-.4.2-.79.58-1l2.09-1.23c.35-.2.77-.2 1.15 0l2.09 1.23c.35.21.58.6.58 1.01v1.6l1.84-1.07v-1.6c0-.4-.2-.78-.58-1l-3.9-2.3a1.2 1.2 0 00-1.15 0l-3.96 2.3c-.38.22-.58.6-.58 1.01v4.63c0 .4.2.79.58 1l3.96 2.3c.35.2.77.2 1.15 0l2.68-1.57 1.84-1.07 2.68-1.57c.35-.2.77-.2 1.15 0l2.1 1.23c.34.2.57.6.57 1v2.46c0 .4-.2.79-.58 1l-2.09 1.26c-.35.2-.77.2-1.15 0l-2.09-1.23a1.2 1.2 0 01-.58-1v-1.6l-1.84 1.07v1.6c0 .4.2.79.58 1l3.96 2.3c.35.2.77.2 1.15 0l3.96-2.3c.35-.2.58-.6.58-1v-4.63c0-.4-.2-.79-.58-1.01l-4-2.33z"
    />
  </svg>
);

const UsdcIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#2775CA" glyph="$" fontSize={18} />
);

const TronIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#EF0027" />
    <path
      fill="#fff"
      d="M6.4 7.9l19.2 3.5-9.9 14.7L6.4 7.9zm3.5 2.7l5 11.8 1-6.7-6-5.1zm7.8 5.3l-1 6.9 6.6-9.9-5.6 3zm6-4.5L11.4 9.6l5.6 4.8 6.7-3z"
    />
  </svg>
);

const MoneroIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#FF6600" glyph="ɱ" fontSize={20} />
);

const ShibaIcon: React.FC<IconProps> = ({ size = 32 }) => (
  <GlyphCoin size={size} color="#FFA409" glyph="S" fontSize={17} />
);

/**
 * Modelo de um ícone padrão selecionável no cadastro
 */
export interface CoinIconPreset {
  id: string;
  label: string;
  /** Cor oficial da marca da moeda */
  color: string;
  /** Sugestão de símbolo preenchida ao selecionar o ícone */
  suggestedSymbol: string;
  Icon: React.FC<IconProps>;
}

export const COIN_ICON_PRESETS: CoinIconPreset[] = [
  { id: 'bitcoin', label: 'Bitcoin', color: '#F7931A', suggestedSymbol: 'BTC', Icon: BitcoinIcon },
  { id: 'ethereum', label: 'Ethereum', color: '#627EEA', suggestedSymbol: 'ETH', Icon: EthereumIcon },
  { id: 'tether', label: 'Tether', color: '#26A17B', suggestedSymbol: 'USDT', Icon: TetherIcon },
  { id: 'bnb', label: 'BNB', color: '#F3BA2F', suggestedSymbol: 'BNB', Icon: BnbIcon },
  { id: 'solana', label: 'Solana', color: '#9945FF', suggestedSymbol: 'SOL', Icon: SolanaIcon },
  { id: 'xrp', label: 'XRP', color: '#23292F', suggestedSymbol: 'XRP', Icon: XrpIcon },
  { id: 'cardano', label: 'Cardano', color: '#0033AD', suggestedSymbol: 'ADA', Icon: CardanoIcon },
  { id: 'dogecoin', label: 'Dogecoin', color: '#C2A633', suggestedSymbol: 'DOGE', Icon: DogecoinIcon },
  { id: 'polkadot', label: 'Polkadot', color: '#E6007A', suggestedSymbol: 'DOT', Icon: PolkadotIcon },
  { id: 'chainlink', label: 'Chainlink', color: '#2A5ADA', suggestedSymbol: 'LINK', Icon: ChainlinkIcon },
  { id: 'litecoin', label: 'Litecoin', color: '#345D9D', suggestedSymbol: 'LTC', Icon: LitecoinIcon },
  { id: 'avalanche', label: 'Avalanche', color: '#E84142', suggestedSymbol: 'AVAX', Icon: AvalancheIcon },
  { id: 'polygon', label: 'Polygon', color: '#8247E5', suggestedSymbol: 'POL', Icon: PolygonIcon },
  { id: 'usdc', label: 'USD Coin', color: '#2775CA', suggestedSymbol: 'USDC', Icon: UsdcIcon },
  { id: 'tron', label: 'TRON', color: '#EF0027', suggestedSymbol: 'TRX', Icon: TronIcon },
  { id: 'monero', label: 'Monero', color: '#FF6600', suggestedSymbol: 'XMR', Icon: MoneroIcon },
  { id: 'shiba', label: 'Shiba Inu', color: '#FFA409', suggestedSymbol: 'SHIB', Icon: ShibaIcon },
];

export const getPresetById = (id?: string): CoinIconPreset | undefined =>
  COIN_ICON_PRESETS.find((preset) => preset.id === id);
