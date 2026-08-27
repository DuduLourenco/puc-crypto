import React from 'react';
import { LineChart, Sparkles, TrendingUp } from 'lucide-react';
import { CryptoAsset } from '../../types/crypto.types';
import { formatBRL } from '../../utils/formatters';

interface MarketChartPlaceholderProps {
  activeCrypto: CryptoAsset | null;
}

export const MarketChartPlaceholder: React.FC<MarketChartPlaceholderProps> = ({
  activeCrypto,
}) => {
  const asset = activeCrypto;

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #181C32 0%, #1e2440 100%)',
        color: '#ffffff',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Graphic Grid */}
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <LineChart size={240} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(27, 132, 255, 0.2)',
              border: '1px solid rgba(27, 132, 255, 0.4)',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>Módulo Gráfico Interativo</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {asset ? `Histórico de Cotações: ${asset.name} (${asset.symbol})` : 'Visão Geral do Mercado'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['1D', '7D', '1M', '1A', 'TODOS'].map((period, i) => (
            <span
              key={period}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: i === 1 ? '#1b84ff' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {period}
            </span>
          ))}
        </div>
      </div>

      {/* Chart SVG Graphic preview */}
      <div style={{ height: '110px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        <svg
          viewBox="0 0 800 120"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1b84ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1b84ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Fill Area */}
          <polygon
            points="0,110 0,90 80,75 160,85 240,60 320,70 400,45 480,55 560,30 640,40 720,20 800,10 800,110"
            fill="url(#chartGrad)"
          />
          {/* Stroke Line */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,90 80,75 160,85 240,60 320,70 400,45 480,55 560,30 640,40 720,20 800,10"
          />
        </svg>
      </div>

      {/* Footer Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '12px',
          marginTop: '8px',
          fontSize: '12px',
        }}
      >
        <span style={{ color: '#cbd5e1' }}>
          Cotação Atual ({asset?.symbol || 'BTC'}):{' '}
          <strong style={{ color: '#ffffff' }}>
            {asset ? formatBRL(asset.priceBrl) : 'R$ 348.920,50'}
          </strong>
        </span>
        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <TrendingUp size={14} />
          <span>Gráfico interativo em tempo real via Azure API</span>
        </span>
      </div>
    </div>
  );
};
