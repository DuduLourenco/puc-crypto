import { ErrorMessage, formatUsd } from '@puccrypto/shared';
import { FormEvent, useState } from 'react';
import { Crypto, CryptoDraft, CryptoDraftErrors, WatchlistItem, isInWatchlist, validateCryptoDraft } from '../domain/crypto';
import { availableSuggestions } from '../domain/popular-coins';

interface Props {
  catalog: Crypto[];
  watchlist: WatchlistItem[];
  onCreate: (draft: CryptoDraft) => Promise<void>;
  onUpdate: (id: string, data: { symbol: string; name: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddToWatchlist: (cryptocurrencyId: string) => Promise<void>;
}

const EMPTY_DRAFT: CryptoDraft = { coinGeckoId: '', symbol: '', name: '' };

/** Catálogo: cadastro, edição e exclusão de criptomoedas, e inclusão na lista do usuário. */
export function CatalogPanel({ catalog, watchlist, onCreate, onUpdate, onDelete, onAddToWatchlist }: Props) {
  const [draft, setDraft] = useState<CryptoDraft>(EMPTY_DRAFT);
  const [draftErrors, setDraftErrors] = useState<CryptoDraftErrors>({});
  const [error, setError] = useState<unknown>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const suggestions = availableSuggestions(catalog.map((crypto) => crypto.coinGeckoId));

  const guard = async (action: () => Promise<void>): Promise<boolean> => {
    try {
      setError(null);
      await action();
      return true;
    } catch (caught) {
      setError(caught);
      return false;
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const errors = validateCryptoDraft(draft);
    setDraftErrors(errors);

    if (Object.keys(errors).length === 0 && (await guard(() => onCreate(draft)))) {
      setDraft(EMPTY_DRAFT);
    }
  };

  return (
    <section className="pc-card" aria-labelledby="catalog-title">
      <div>
        <h2 id="catalog-title">Catálogo</h2>
        <p className="pc-muted">Moedas disponíveis para todos os usuários. Os preços são coletados da CoinGecko.</p>
      </div>

      <form className="pc-form" onSubmit={submit} noValidate aria-label="Cadastrar criptomoeda">
        {suggestions.length > 0 && (
          <label className="pc-field">
            <span>Sugestões</span>
            <select
              className="pc-select"
              value=""
              onChange={(event) => {
                const coin = suggestions.find((suggestion) => suggestion.coinGeckoId === event.target.value);
                if (coin) {
                  setDraft(coin);
                  setDraftErrors({});
                }
              }}
            >
              <option value="">Escolha uma moeda conhecida para preencher…</option>
              {suggestions.map((coin) => (
                <option key={coin.coinGeckoId} value={coin.coinGeckoId}>
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="pc-grid-3">
          <label className="pc-field">
            <span>Id na CoinGecko</span>
            <input className="pc-input" value={draft.coinGeckoId} placeholder="bitcoin" onChange={(event) => setDraft({ ...draft, coinGeckoId: event.target.value })} />
          </label>
          <label className="pc-field">
            <span>Símbolo</span>
            <input className="pc-input" value={draft.symbol} placeholder="BTC" onChange={(event) => setDraft({ ...draft, symbol: event.target.value })} />
          </label>
          <label className="pc-field">
            <span>Nome</span>
            <input className="pc-input" value={draft.name} placeholder="Bitcoin" onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
        </div>

        {Object.values(draftErrors).map((message) => (
          <small key={message} role="alert">
            {message}
          </small>
        ))}

        <div>
          <button className="pc-button" type="submit">
            Cadastrar no catálogo
          </button>
        </div>
      </form>

      <ErrorMessage error={error} />

      {catalog.length === 0 ? (
        <p className="pc-subtitle">O catálogo está vazio. Cadastre a primeira moeda.</p>
      ) : (
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Moeda</th>
                <th className="pc-num">Último preço</th>
                <th>
                  <span className="pc-muted">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((crypto) =>
                editingId === crypto.id ? (
                  <EditRow
                    key={crypto.id}
                    crypto={crypto}
                    onCancel={() => setEditingId(null)}
                    onSave={async (data) => {
                      if (await guard(() => onUpdate(crypto.id, data))) {
                        setEditingId(null);
                      }
                    }}
                  />
                ) : (
                  <tr key={crypto.id}>
                    <td>
                      <strong>{crypto.symbol}</strong> <span className="pc-muted">{crypto.name}</span>
                      <div className="pc-muted">{crypto.coinGeckoId}</div>
                    </td>
                    <td className="pc-num">{formatUsd(crypto.latestPriceUsd)}</td>
                    <td>
                      <div className="pc-row">
                        {isInWatchlist(crypto, watchlist) ? (
                          <span className="pc-badge">Na sua lista</span>
                        ) : (
                          <button className="pc-button pc-button--small" type="button" aria-label={`Adicionar ${crypto.name} à minha lista`} onClick={() => void guard(() => onAddToWatchlist(crypto.id))}>
                            Adicionar à lista
                          </button>
                        )}
                        <button className="pc-button pc-button--ghost pc-button--small" type="button" aria-label={`Editar ${crypto.name}`} onClick={() => setEditingId(crypto.id)}>
                          Editar
                        </button>
                        <button
                          className="pc-button pc-button--danger pc-button--small"
                          type="button"
                          aria-label={`Excluir ${crypto.name} do catálogo`}
                          onClick={() => {
                            if (window.confirm(`Excluir ${crypto.name} do catálogo? O histórico de preços dela será apagado.`)) {
                              void guard(() => onDelete(crypto.id));
                            }
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EditRow({ crypto, onSave, onCancel }: { crypto: Crypto; onSave: (data: { symbol: string; name: string }) => Promise<void>; onCancel: () => void }) {
  const [symbol, setSymbol] = useState(crypto.symbol);
  const [name, setName] = useState(crypto.name);

  return (
    <tr>
      <td colSpan={2}>
        <div className="pc-row">
          <input className="pc-input" style={{ maxWidth: 110 }} aria-label="Símbolo" value={symbol} onChange={(event) => setSymbol(event.target.value)} />
          <input className="pc-input" style={{ maxWidth: 220 }} aria-label="Nome" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="pc-muted">{crypto.coinGeckoId} (não pode ser alterado)</div>
      </td>
      <td>
        <div className="pc-row">
          <button className="pc-button pc-button--small" type="button" disabled={!symbol.trim() || !name.trim()} onClick={() => void onSave({ symbol, name })}>
            Salvar
          </button>
          <button className="pc-button pc-button--ghost pc-button--small" type="button" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  );
}
