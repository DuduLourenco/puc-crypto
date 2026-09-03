import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Subheader } from './components/layout/Subheader';
import { HeroBanner } from './components/dashboard/HeroBanner';
import { HighlightsCard } from './components/dashboard/HighlightsCard';
import { CryptoTable } from './components/dashboard/CryptoTable';
import { WatchlistCard } from './components/dashboard/WatchlistCard';
import { MarketChartPlaceholder } from './components/dashboard/MarketChartPlaceholder';
import { ApiStatusModal } from './components/dashboard/ApiStatusModal';
import { CoinRegisterPage } from './components/coins/CoinRegisterPage';
import { cryptoService } from './services/cryptoService';
import { userService } from './services/userService';
import { currentApiStatus, subscribeToApiStatus, ApiStatusState } from './services/apiClient';
import { CryptoAsset, MarketOverview } from './types/crypto.types';
import { UserProfile } from './types/user.types';

export const App: React.FC = () => {
  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  // API Data States
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | undefined>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiStatus, setApiStatus] = useState<ApiStatusState>(currentApiStatus);

  // Selected crypto for chart inspection
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);

  // Modals States
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  // Carrega dados informativos da API Azure (ou mock fallback)
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [cryptosResponse, meResponse] = await Promise.all([
        cryptoService.getCryptos(),
        userService.getMe(),
      ]);

      if (cryptosResponse?.data) {
        setCryptos(cryptosResponse.data);
        if (cryptosResponse.marketOverview) {
          setMarketOverview(cryptosResponse.marketOverview);
        }
        if (!selectedCrypto && cryptosResponse.data.length > 0) {
          setSelectedCrypto(cryptosResponse.data[0]);
        }
      }
      if (meResponse?.data) {
        setUser(meResponse.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados informativos do dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToApiStatus((newStatus) => {
      setApiStatus(newStatus);
    });

    loadDashboardData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Lista de IDs favoritados pelo usuário
  const watchlistCryptoIds = user?.watchlist.map((w) => w.cryptoId) || [];

  // Alternar favorito na watchlist
  const handleToggleWatchlist = async (crypto: CryptoAsset) => {
    const existing = user?.watchlist.find((w) => w.cryptoId === crypto.id);
    if (existing) {
      handleRemoveWatchlist(existing.id);
    } else {
      handleAddCryptoToWatchlist(crypto);
    }
  };

  const handleAddCryptoToWatchlist = async (crypto: CryptoAsset) => {
    try {
      const newItem = await userService.addWatchlistItem({
        cryptoId: crypto.id,
        name: `${crypto.name} (${crypto.symbol})`,
        symbol: crypto.symbol,
        iconUrl: crypto.iconUrl,
      });
      if (user) {
        setUser({
          ...user,
          watchlist: [newItem, ...user.watchlist],
        });
      }
    } catch (err) {
      console.error('Erro ao favoritar cripto:', err);
    }
  };

  const handleRemoveWatchlist = async (id: string) => {
    try {
      await userService.removeWatchlistItem(id);
      if (user) {
        setUser({
          ...user,
          watchlist: user.watchlist.filter((w) => w.id !== id),
        });
      }
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    }
  };

  const scrollToTable = () => {
    const tableEl = document.getElementById('input-busca-crypto');
    if (tableEl) {
      tableEl.focus();
      tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="app-container">
      {/* Slim Sidebar */}
      <Sidebar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onOpenApiModal={() => setIsApiModalOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header
          user={user}
          isLoading={isLoading}
          onRefreshData={loadDashboardData}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          isMockFallback={apiStatus.isUsingMockFallback}
        />

        {/* Subheader (apenas no dashboard) */}
        {activeNavTab === 'dashboard' && (
          <Subheader
            currentTab={activeSubTab}
            onSelectTab={setActiveSubTab}
            selectedPeriod="Agosto, 2026"
          />
        )}

        {/* Tela de Cadastro de Moeda */}
        {activeNavTab === 'coins' && <CoinRegisterPage />}

        {/* Dashboard Body */}
        {activeNavTab === 'dashboard' && (
          <main className="content-body">
            {/* Top Grid: Hero Card (Left) + Highlights Card (Right) */}
            <div className="dashboard-grid-top">
              <HeroBanner onExploreMarket={scrollToTable} />
              <HighlightsCard
                marketOverview={marketOverview}
                topCryptos={cryptos}
                onSelectCrypto={(crypto) => setSelectedCrypto(crypto)}
              />
            </div>

            {/* Interactive Chart Preview Area */}
            <MarketChartPlaceholder activeCrypto={selectedCrypto} />

            {/* Bottom Grid: Informative Crypto Table (Left) + Watchlist (Right) */}
            <div className="dashboard-grid-bottom">
              <CryptoTable
                cryptos={cryptos}
                isLoading={isLoading}
                watchlistCryptoIds={watchlistCryptoIds}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectCrypto={(crypto) => setSelectedCrypto(crypto)}
              />
              <WatchlistCard
                watchlist={user?.watchlist || []}
                availableCryptos={cryptos}
                onAddCryptoToWatchlist={handleAddCryptoToWatchlist}
                onRemoveFromWatchlist={handleRemoveWatchlist}
              />
            </div>
          </main>
        )}
      </div>

      {/* Modal de Detalhes da API Azure */}
      <ApiStatusModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiStatus={apiStatus}
        user={user}
        cryptos={cryptos}
        onReload={loadDashboardData}
      />
    </div>
  );
};

export default App;
