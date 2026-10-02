namespace PucCrypto.Catalog.Domain.Cryptocurrencies;

/// <summary>Criptomoeda do catálogo, compartilhada por todos os usuários que a monitoram.</summary>
public sealed class Cryptocurrency
{
    public const int SymbolMaxLength = 10;
    public const int NameMaxLength = 100;
    public const int CoinGeckoIdMaxLength = 100;

    private Cryptocurrency(Guid id, string symbol, string name, string coinGeckoId, DateTime createdAt)
    {
        Id = id;
        Symbol = symbol;
        Name = name;
        CoinGeckoId = coinGeckoId;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public string Symbol { get; private set; }

    public string Name { get; private set; }

    /// <summary>Identificador da moeda na API CoinGecko (ex.: "bitcoin").</summary>
    public string CoinGeckoId { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public static Cryptocurrency Create(string symbol, string name, string coinGeckoId, DateTime createdAt) =>
        new(Guid.NewGuid(), symbol.Trim().ToUpperInvariant(), name.Trim(), NormalizeCoinGeckoId(coinGeckoId), createdAt);

    public static string NormalizeCoinGeckoId(string coinGeckoId) => coinGeckoId.Trim().ToLowerInvariant();
}
