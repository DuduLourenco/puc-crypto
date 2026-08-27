import React from 'react';
import {
  LayoutDashboard,
  CloudLightning,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenApiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenApiModal,
}) => {
  return (
    <aside className="sidebar" aria-label="Menu Lateral">
      {/* Logo Brand */}
      <div 
        className="sidebar-logo" 
        title="PUC Crypto"
        onClick={() => onTabChange('dashboard')}
      >
        <span style={{ letterSpacing: '-1px' }}>M</span>
      </div>

      {/* Navigation - Único Item */}
      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
          title="Dashboard de Criptomoedas"
          aria-label="Dashboard de Criptomoedas"
        >
          <LayoutDashboard size={20} strokeWidth={2.2} />
        </button>
      </nav>

      {/* Azure API Status Trigger */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <button
          className="sidebar-nav-item"
          style={{ color: '#0284c7' }}
          onClick={onOpenApiModal}
          title="Status & Configuração da API Azure"
        >
          <CloudLightning size={20} />
        </button>
      </div>
    </aside>
  );
};
