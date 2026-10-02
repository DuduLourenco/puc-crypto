namespace PucCrypto.MarketData.Application.Abstractions;

/// <summary>Porta para a fonte externa de preços (CoinGecko).</summary>
public interface IMarketPriceProvider
{
    /// <summary>Preço atual de cada identificador. Identificadores desconhecidos ficam fora do resultado.</summary>
    Task<IReadOnlyDictionary<string, MarketPrice>> GetCurrentPricesAsync(
        IReadOnlyCollection<string> coinGeckoIds,
        CancellationToken cancellationToken);

    /// <summary>Um preço por dia, dos últimos <paramref name="days"/> dias.</summary>
    Task<IReadOnlyList<MarketPrice>> GetDailyHistoryAsync(string coinGeckoId, int days, CancellationToken cancellationToken);
}

public sealed record MarketPrice(DateTime Timestamp, decimal PriceUsd);

/// <summary>A fonte de preços não respondeu ou recusou a requisição.</summary>
public sealed class MarketPriceUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);
