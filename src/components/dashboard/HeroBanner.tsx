import React from 'react';
import { ShieldCheck, Zap, LineChart } from 'lucide-react';

interface HeroBannerProps {
  onExploreMarket: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreMarket }) => {
  return (
    <div className="card hero-card">
      {/* Illustration Area */}
      <div className="hero-illustration-wrapper">
        <svg
          width="130"
          height="110"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Decorative burst sparks */}
          <path d="M40 30L50 42M30 45L45 50M155 35L145 45M165 48L150 52" stroke="#181C32" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="18" r="2.5" fill="#181C32" />
          <circle cx="55" cy="22" r="2" fill="#181C32" />
          <circle cx="145" cy="25" r="2" fill="#181C32" />

          {/* Left Fist / Team Hands */}
          <path
            d="M65 140V105C65 98 70 94 77 94C80 94 85 97 86 100V85C86 78 92 74 97 74C102 74 107 78 107 85V75C107 68 113 65 118 65C124 65 128 70 128 77V92C132 92 138 95 138 102V140"
            stroke="#181C32"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />

          {/* Hand lines & cuff */}
          <path d="M60 140H142" stroke="#181C32" strokeWidth="3" strokeLinecap="round" />
          <path d="M68 115C76 112 88 112 96 115" stroke="#181C32" strokeWidth="2" strokeLinecap="round" />
          <path d="M96 105C106 102 118 102 126 105" stroke="#181C32" strokeWidth="2" strokeLinecap="round" />

          {/* Raised Arms */}
          <path
            d="M38 145L55 110C58 102 65 98 72 102C78 105 80 112 76 120L62 148"
            stroke="#181C32"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
          <path
            d="M162 145L145 110C142 102 135 98 128 102C122 105 120 112 124 120L138 148"
            stroke="#181C32"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
        </svg>

        {/* Floating Badges */}
        <div className="hero-badge-floating" style={{ top: '5px', left: '-20px' }}>
          <ShieldCheck size={13} style={{ color: '#17c653' }} />
          <span>Azure API</span>
        </div>
        <div className="hero-badge-floating" style={{ bottom: '15px', right: '-25px' }}>
          <Zap size={13} style={{ color: '#f6c000' }} />
          <span>Cotações BRL 24/7</span>
        </div>
      </div>

      {/* Title & Description */}
      <h2 className="hero-title">Painel Informativo Crypto</h2>
      <p className="hero-subtitle">
        Acompanhe cotações em Reais (BRL), métricas de capitalização, variação em 24h
        e tendências do mercado de criptoativos alimentadas pela API hospedada no Azure.
      </p>

      {/* Action Button */}
      <button className="btn-hero-dark" onClick={onExploreMarket} id="btn-hero-explore">
        <LineChart size={16} />
        <span>Explorar Cotações</span>
      </button>
    </div>
  );
};
