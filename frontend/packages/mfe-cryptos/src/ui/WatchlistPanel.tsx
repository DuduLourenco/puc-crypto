import { ErrorMessage, formatDateTime, formatUsd } from '@puccrypto/shared';
import { useState } from 'react';
import { NOTES_MAX_LENGTH, WatchlistItem } from '../domain/crypto';

interface Props {
  watchlist: WatchlistItem[];
  onSaveNotes: (id: string, notes: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

/** Lista do usuário: mostra o último preço e permite anotar e remover. */
export function WatchlistPanel({ watchlist, onSaveNotes, onRemove }: Props) {
  const [error, setError] = useState<unknown>(null);

  const guard = (action: () => Promise<void>) => async () => {
    try {
      setError(null);
      await action();
    } catch (caught) {
      setError(caught);
    }
  };

  return (
    <section className="pc-card" aria-labelledby="watchlist-title">
      <div>
        <h2 id="watchlist-title">Minha lista</h2>
        <p className="pc-muted">As moedas daqui aparecem no dashboard, com histórico e previsão.</p>
      </div>

      <ErrorMessage error={error} />

      {watchlist.length === 0 ? (
        <p className="pc-subtitle">Sua lista está vazia. Adicione uma moeda do catálogo.</p>
      ) : (
        <div className="pc-table-wrap">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Moeda</th>
                <th className="pc-num">Último preço</th>
                <th>Anotação</th>
                <th>
                  <span className="pc-muted">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => (
                <WatchlistRow
                  key={item.id}
                  item={item}
                  onSaveNotes={(notes) => guard(() => onSaveNotes(item.id, notes))()}
                  onRemove={guard(() => onRemove(item.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function WatchlistRow({ item, onSaveNotes, onRemove }: { item: WatchlistItem; onSaveNotes: (notes: string) => Promise<void>; onRemove: () => Promise<void> }) {
  const [notes, setNotes] = useState(item.notes ?? '');
  const changed = notes.trim() !== (item.notes ?? '');

  return (
    <tr>
      <td>
        <strong>{item.symbol}</strong> <span className="pc-muted">{item.name}</span>
      </td>
      <td className="pc-num" title={item.latestPriceAt ? `Atualizado em ${formatDateTime(item.latestPriceAt)}` : 'Ainda sem preço coletado'}>
        {formatUsd(item.latestPriceUsd)}
      </td>
      <td>
        <input
          className="pc-input"
          aria-label={`Anotação de ${item.name}`}
          value={notes}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="Sem anotação"
          onChange={(event) => setNotes(event.target.value)}
        />
      </td>
      <td>
        <div className="pc-row">
          <button className="pc-button pc-button--small" type="button" disabled={!changed} onClick={() => void onSaveNotes(notes)}>
            Salvar
          </button>
          <button className="pc-button pc-button--danger pc-button--small" type="button" aria-label={`Remover ${item.name} da lista`} onClick={() => void onRemove()}>
            Remover
          </button>
        </div>
      </td>
    </tr>
  );
}
