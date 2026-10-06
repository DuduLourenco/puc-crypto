import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { addToWatchlist } from '../src/application/features/add-to-watchlist/add-to-watchlist';
import { createCrypto } from '../src/application/features/create-crypto/create-crypto';
import { updateWatchlistNotes } from '../src/application/features/update-watchlist-notes/update-watchlist-notes';
import { CatalogGateway } from '../src/application/ports/catalog.gateway';
import { Crypto, WatchlistItem, notInWatchlist, validateCryptoDraft } from '../src/domain/crypto';
import { availableSuggestions } from '../src/domain/popular-coins';
import { CryptosPage } from '../src/ui/CryptosPage';
import { CryptosActions } from '../src/ui/cryptos-actions';

const bitcoin: Crypto = { id: 'c1', symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin', latestPriceUsd: 65000, latestPriceAt: '2026-01-01T00:00:00Z', createdAt: '2026-01-01T00:00:00Z' };
const ethereum: Crypto = { ...bitcoin, id: 'c2', symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum', latestPriceUsd: null, latestPriceAt: null };
const watched: WatchlistItem = { id: 'w1', cryptocurrencyId: 'c1', symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin', latestPriceUsd: 65000, latestPriceAt: '2026-01-01T00:00:00Z', notes: 'longo prazo', addedAt: '2026-01-01T00:00:00Z' };

describe('regras do catálogo (domínio)', () => {
  it('valida identificador, símbolo e nome', () => {
    expect(validateCryptoDraft({ coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' })).toEqual({});
    expect(Object.keys(validateCryptoDraft({ coinGeckoId: 'tem espaço', symbol: '', name: ' ' })).sort()).toEqual(['coinGeckoId', 'name', 'symbol']);
  });

  it('separa as moedas do catálogo que ainda não estão na lista', () => {
    expect(notInWatchlist([bitcoin, ethereum], [watched])).toEqual([ethereum]);
  });

  it('sugere apenas moedas ainda não cadastradas', () => {
    const suggestions = availableSuggestions(['bitcoin']);

    expect(suggestions.some((coin) => coin.coinGeckoId === 'bitcoin')).toBe(false);
    expect(suggestions.some((coin) => coin.coinGeckoId === 'ethereum')).toBe(true);
  });
});

describe('casos de uso', () => {
  const gateway = () =>
    ({ createCrypto: vi.fn(), addToWatchlist: vi.fn(), updateWatchlistNotes: vi.fn() }) as unknown as CatalogGateway & Record<string, ReturnType<typeof vi.fn>>;

  it('createCrypto normaliza o identificador e o símbolo', async () => {
    const catalog = gateway();

    await createCrypto(catalog, { coinGeckoId: ' Bitcoin ', symbol: 'btc', name: ' Bitcoin ' });

    expect(catalog.createCrypto).toHaveBeenCalledWith({ coinGeckoId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' });
  });

  it('anotação em branco é enviada como ausente', async () => {
    const catalog = gateway();

    await addToWatchlist(catalog, 'c1');
    await updateWatchlistNotes(catalog, 'w1', '   ');

    expect(catalog.addToWatchlist).toHaveBeenCalledWith('c1', null);
    expect(catalog.updateWatchlistNotes).toHaveBeenCalledWith('w1', null);
  });
});

describe('CryptosPage', () => {
  const actions = (overrides: Partial<CryptosActions> = {}): CryptosActions => ({
    listCatalog: vi.fn().mockResolvedValue([bitcoin, ethereum]),
    listWatchlist: vi.fn().mockResolvedValue([watched]),
    createCrypto: vi.fn().mockResolvedValue(bitcoin),
    updateCrypto: vi.fn().mockResolvedValue(bitcoin),
    deleteCrypto: vi.fn().mockResolvedValue(undefined),
    addToWatchlist: vi.fn().mockResolvedValue(watched),
    updateWatchlistNotes: vi.fn().mockResolvedValue(watched),
    removeFromWatchlist: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  it('mostra a lista do usuário e o catálogo', async () => {
    render(<CryptosPage actions={actions()} />);

    const watchlist = within(await screen.findByRole('region', { name: 'Minha lista' }));
    expect(watchlist.getByText('BTC')).toBeInTheDocument();
    expect(watchlist.getByDisplayValue('longo prazo')).toBeInTheDocument();

    const catalog = within(screen.getByRole('region', { name: 'Catálogo' }));
    expect(catalog.getByText('Na sua lista')).toBeInTheDocument();
    expect(catalog.getByRole('button', { name: 'Adicionar Ethereum à minha lista' })).toBeInTheDocument();
  });

  it('adiciona uma moeda do catálogo à lista e recarrega', async () => {
    const all = actions();
    render(<CryptosPage actions={all} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar Ethereum à minha lista' }));

    expect(all.addToWatchlist).toHaveBeenCalledWith('c2');
    expect(all.listWatchlist).toHaveBeenCalledTimes(2);
  });

  it('cadastra uma moeda a partir de uma sugestão', async () => {
    const all = actions({ listCatalog: vi.fn().mockResolvedValue([]), listWatchlist: vi.fn().mockResolvedValue([]) });
    render(<CryptosPage actions={all} />);

    await userEvent.selectOptions(await screen.findByLabelText('Sugestões'), 'solana');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar no catálogo' }));

    expect(all.createCrypto).toHaveBeenCalledWith({ coinGeckoId: 'solana', symbol: 'SOL', name: 'Solana' });
  });

  it('não envia um cadastro inválido', async () => {
    const all = actions();
    render(<CryptosPage actions={all} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Cadastrar no catálogo' }));

    expect(all.createCrypto).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o nome.')).toBeInTheDocument();
  });

  it('mostra o erro devolvido pelo servidor ao excluir uma moeda em uso', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const all = actions({ deleteCrypto: vi.fn().mockRejectedValue(new Error('A criptomoeda está na lista de pelo menos um usuário.')) });
    render(<CryptosPage actions={all} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir Bitcoin do catálogo' }));

    expect(await screen.findByText(/está na lista de pelo menos um usuário/)).toBeInTheDocument();
  });
});
