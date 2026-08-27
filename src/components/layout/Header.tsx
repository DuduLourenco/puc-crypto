import React from 'react';
import {
  Search,
  MessageSquare,
  LayoutGrid,
  Bell,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../../types/user.types';

interface HeaderProps {
  user: UserProfile | null;
  isLoading: boolean;
  onRefreshData: () => void;
  onOpenApiModal: () => void;
  isMockFallback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isLoading,
  onRefreshData,
  onOpenApiModal,
  isMockFallback,
}) => {
  return (
    <header className="header">
      {/* Left Workspace Switcher */}
      <div className="header-left">
        <div className="header-brand-tag" onClick={onOpenApiModal}>
          <span>PUC Crypto</span>
          <span className="divider">/</span>
          <span className="context">Dashboard Informativo</span>
          <ChevronDown size={14} style={{ color: 'var(--gray-500)' }} />
        </div>

        {/* Azure API Mode Badge */}
        <button
          onClick={onOpenApiModal}
          className="badge-pill"
          style={{
            background: isMockFallback ? '#fef3c7' : '#e0f2fe',
            color: isMockFallback ? '#b45309' : '#0369a1',
            border: `1px solid ${isMockFallback ? '#fde68a' : '#bae6fd'}`,
            marginLeft: '8px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
          title="Clique para ver detalhes da conexão Azure API"
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isMockFallback ? '#f59e0b' : '#0284c7',
            }}
          />
          {isMockFallback ? 'Azure API (Mock Fallback)' : 'Azure API Conectada'}
        </button>
      </div>

      {/* Right Actions */}
      <div className="header-right">
        {/* Refresh Button */}
        <button
          className="icon-btn"
          onClick={onRefreshData}
          title="Atualizar cotações em tempo real"
          disabled={isLoading}
        >
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Search */}
        <button className="icon-btn" title="Buscar no sistema">
          <Search size={17} />
        </button>

        {/* Messages */}
        <button className="icon-btn" title="Mensagens">
          <MessageSquare size={17} />
        </button>

        {/* Apps Grid */}
        <button className="icon-btn" title="Módulos & Aplicações">
          <LayoutGrid size={17} />
        </button>

        {/* Notifications */}
        <button className="icon-btn" title="Notificações">
          <Bell size={17} />
          <span className="icon-badge" />
        </button>

        {/* User Profile Avatar */}
        <div
          className="user-avatar-btn"
          onClick={onOpenApiModal}
          title={user ? `${user.name} (${user.role} - ${user.organization})` : 'Usuário'}
        >
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.name || 'Perfil'}
            className="user-avatar-img"
          />
        </div>
      </div>
    </header>
  );
};
