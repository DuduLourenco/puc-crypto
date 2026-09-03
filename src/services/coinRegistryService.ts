import { CustomCoin, CustomCoinInput } from '../types/coin.types';

const STORAGE_KEY = 'puc-crypto:custom-coins';

/**
 * Serviço de cadastro local de moedas.
 * Persiste no localStorage para que as moedas criadas sobrevivam ao refresh
 * enquanto o endpoint da API Azure não expõe escrita de novos ativos.
 */
export const coinRegistryService = {
  /** Lista as moedas cadastradas, da mais recente para a mais antiga */
  list(): CustomCoin[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CustomCoin[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('Erro ao ler moedas cadastradas:', err);
      return [];
    }
  },

  /** Cadastra uma nova moeda e devolve o registro criado */
  create(input: CustomCoinInput): CustomCoin {
    const coin: CustomCoin = {
      id: `coin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      symbol: input.symbol.trim().toUpperCase(),
      iconSource: input.iconSource,
      iconPresetId: input.iconPresetId,
      iconDataUrl: input.iconDataUrl,
      iconFileName: input.iconFileName,
      createdAt: new Date().toISOString(),
    };

    const coins = [coin, ...coinRegistryService.list()];
    coinRegistryService.persist(coins);
    return coin;
  },

  /** Remove uma moeda cadastrada e devolve a lista atualizada */
  remove(id: string): CustomCoin[] {
    const coins = coinRegistryService.list().filter((coin) => coin.id !== id);
    coinRegistryService.persist(coins);
    return coins;
  },

  /** Verifica se já existe uma moeda com o mesmo símbolo */
  symbolExists(symbol: string): boolean {
    const normalized = symbol.trim().toUpperCase();
    return coinRegistryService.list().some((coin) => coin.symbol === normalized);
  },

  persist(coins: CustomCoin[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coins));
    } catch (err) {
      console.error('Erro ao salvar moedas cadastradas:', err);
    }
  },
};
