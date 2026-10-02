using PucCrypto.MarketData.Application.Abstractions;

namespace PucCrypto.MarketData.UnitTests.Fakes;

internal sealed class FakeMarketPriceProvider : IMarketPriceProvider
{
    public Dictionary<string, MarketPrice> CurrentPrices { get; } = [];

    public Dictionary<string, List<MarketPrice>> History { get; } = [];

    public bool Unavailable { get; set; }

    public Task<IReadOnlyDictionary<string, MarketPrice>> GetCurrentPricesAsync(
        IReadOnlyCollection<string> coinGeckoIds, CancellationToken cancellationToken)
    {
        ThrowIfUnavailable();
        return Task.FromResult<IReadOnlyDictionary<string, MarketPrice>>(
            CurrentPrices.Where(price => coinGeckoIds.Contains(price.Key)).ToDictionary());
    }

    public Task<IReadOnlyList<MarketPrice>> GetDailyHistoryAsync(string coinGeckoId, int days, CancellationToken cancellationToken)
    {
        ThrowIfUnavailable();
        return Task.FromResult<IReadOnlyList<MarketPrice>>(History.GetValueOrDefault(coinGeckoId) ?? []);
    }

    private void ThrowIfUnavailable()
    {
        if (Unavailable)
        {
            throw new MarketPriceUnavailableException("CoinGecko fora do ar (simulado).");
        }
    }
}
