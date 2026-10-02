namespace PucCrypto.MarketData.Domain.TrackedAssets;

/// <summary>
/// Criptomoeda cujo preço é coletado. É uma cópia local, alimentada pelos eventos
/// do Catalog; o Id é o mesmo da criptomoeda no Catalog.
/// </summary>
public sealed class TrackedAsset
{
    private TrackedAsset(Guid id, string coinGeckoId, string symbol, string name, DateTime trackedSince)
    {
        Id = id;
        CoinGeckoId = coinGeckoId;
        Symbol = symbol;
        Name = name;
        TrackedSince = trackedSince;
    }

    public Guid Id { get; private set; }

    public string CoinGeckoId { get; private set; }

    public string Symbol { get; private set; }

    public string Name { get; private set; }

    public DateTime TrackedSince { get; private set; }

    public static TrackedAsset Create(Guid cryptocurrencyId, string coinGeckoId, string symbol, string name, DateTime trackedSince) =>
        new(cryptocurrencyId, coinGeckoId.Trim().ToLowerInvariant(), symbol.Trim().ToUpperInvariant(), name.Trim(), trackedSince);
}
