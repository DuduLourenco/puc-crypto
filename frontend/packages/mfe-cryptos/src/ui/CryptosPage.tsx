import { ErrorMessage, Loading } from '@puccrypto/shared';
import { useCallback, useEffect, useState } from 'react';
import { Crypto, WatchlistItem } from '../domain/crypto';
import { CatalogPanel } from './CatalogPanel';
import { WatchlistPanel } from './WatchlistPanel';
import { CryptosActions } from './cryptos-actions';

/** Tela de criptomoedas: a lista do usuário e o catálogo, cada um com o seu CRUD. */
export function CryptosPage({ actions }: { actions: CryptosActions }) {
  const [catalog, setCatalog] = useState<Crypto[] | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    try {
      const [cryptos, items] = await Promise.all([actions.listCatalog(), actions.listWatchlist()]);
      setCatalog(cryptos);
      setWatchlist(items);
      setError(null);
    } catch (caught) {
      setError(caught);
    }
  }, [actions]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Executa uma ação da tela e recarrega as duas listas; devolve o erro, se houver, a quem chamou. */
  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      await action();
      await reload();
    },
    [reload],
  );

  return (
    <div className="pc-page">
      <header className="pc-page__header">
        <div>
          <h1>Criptomoedas</h1>
          <p className="pc-subtitle">Monte a sua lista a partir do catálogo. O preço de uma moeda nova chega em alguns instantes.</p>
        </div>
        <button className="pc-button pc-button--ghost" type="button" onClick={() => void reload()}>
          Atualizar
        </button>
      </header>

      <ErrorMessage error={error} />

      {catalog === null || watchlist === null ? (
        !error && <Loading />
      ) : (
        <>
          <WatchlistPanel
            watchlist={watchlist}
            onSaveNotes={(id, notes) => run(() => actions.updateWatchlistNotes(id, notes))}
            onRemove={(id) => run(() => actions.removeFromWatchlist(id))}
          />
          <CatalogPanel
            catalog={catalog}
            watchlist={watchlist}
            onCreate={(draft) => run(() => actions.createCrypto(draft))}
            onUpdate={(id, data) => run(() => actions.updateCrypto(id, data))}
            onDelete={(id) => run(() => actions.deleteCrypto(id))}
            onAddToWatchlist={(id) => run(() => actions.addToWatchlist(id))}
          />
        </>
      )}
    </div>
  );
}
