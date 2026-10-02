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

    /// <summary>Último preço em dólar informado pelo MarketData (evento PricesIngested).</summary>
    public decimal? LatestPriceUsd { get; private set; }

    public DateTime? LatestPriceAt { get; private set; }

    public static Cryptocurrency Create(string symbol, string name, string coinGeckoId, DateTime createdAt) =>
        new(Guid.NewGuid(), NormalizeSymbol(symbol), name.Trim(), NormalizeCoinGeckoId(coinGeckoId), createdAt);

    /// <summary>O identificador na CoinGecko não muda: é por ele que o histórico de preços é coletado.</summary>
    public void Update(string symbol, string name)
    {
        Symbol = NormalizeSymbol(symbol);
        Name = name.Trim();
    }

    /// <summary>
    /// Guarda o preço apenas se ele for mais recente que o atual: os eventos podem
    /// chegar fora de ordem.
    /// </summary>
    public bool UpdateLatestPrice(decimal priceUsd, DateTime at)
    {
        if (LatestPriceAt is not null && at <= LatestPriceAt)
        {
            return false;
        }

        LatestPriceUsd = priceUsd;
        LatestPriceAt = at;

        return true;
    }

    public static string NormalizeCoinGeckoId(string coinGeckoId) => coinGeckoId.Trim().ToLowerInvariant();

    private static string NormalizeSymbol(string symbol) => symbol.Trim().ToUpperInvariant();
}
