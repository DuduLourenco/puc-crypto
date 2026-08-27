import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface SubheaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedPeriod: string;
}

export const Subheader: React.FC<SubheaderProps> = ({
  currentTab,
  onSelectTab,
  selectedPeriod = 'Agosto, 2026',
}) => {
  const tabs = [
    { id: 'overview', label: 'Visão Geral', hasDropdown: true },
    { id: 'cryptos', label: 'Cotações & Mercado', hasDropdown: true },
    { id: 'charts', label: 'Gráficos Interativos (Em breve)', hasDropdown: false },
    { id: 'watchlist', label: 'Favoritos', hasDropdown: false },
    { id: 'azure-api', label: 'API Azure', hasDropdown: false },
    { id: 'more', label: 'Mais', hasDropdown: true },
  ];

  return (
    <div className="subheader">
      {/* Subheader Navigation Tabs */}
      <nav className="subheader-tabs" aria-label="Abas de Navegação">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.hasDropdown && (
                <ChevronDown
                  size={13}
                  style={{
                    color: isActive ? 'var(--dark)' : 'var(--gray-500)',
                    marginTop: '1px',
                  }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Date / Period Selector */}
      <button className="date-selector-pill" title="Período das cotações">
        <Calendar size={15} style={{ color: 'var(--gray-500)' }} />
        <span>{selectedPeriod}</span>
        <ChevronDown size={13} style={{ color: 'var(--gray-400)' }} />
      </button>
    </div>
  );
};
