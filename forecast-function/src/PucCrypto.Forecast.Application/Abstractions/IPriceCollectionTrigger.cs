namespace PucCrypto.Forecast.Application.Abstractions;

/// <summary>Porta para pedir ao MarketData que colete os preços atuais.</summary>
public interface IPriceCollectionTrigger
{
    Task<PriceCollectionSummary> TriggerAsync(CancellationToken cancellationToken);
}

public sealed record PriceCollectionSummary(int CollectedCount, IReadOnlyList<string> NotFoundCoinGeckoIds);

/// <summary>O MarketData não respondeu ou recusou o pedido de coleta.</summary>
public sealed class PriceCollectionUnavailableException(string message, Exception? innerException = null)
    : Exception(message, innerException);
