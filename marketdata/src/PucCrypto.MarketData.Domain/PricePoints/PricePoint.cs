namespace PucCrypto.MarketData.Domain.PricePoints;

/// <summary>Preço em dólar de uma criptomoeda em um instante. Há no máximo um preço por instante.</summary>
public sealed class PricePoint
{
    private PricePoint(Guid id, Guid cryptocurrencyId, DateTime timestamp, decimal priceUsd, PriceSource source)
    {
        Id = id;
        CryptocurrencyId = cryptocurrencyId;
        Timestamp = timestamp;
        PriceUsd = priceUsd;
        Source = source;
    }

    public Guid Id { get; private set; }

    public Guid CryptocurrencyId { get; private set; }

    public DateTime Timestamp { get; private set; }

    public decimal PriceUsd { get; private set; }

    public PriceSource Source { get; private set; }

    public static PricePoint Create(Guid cryptocurrencyId, DateTime timestamp, decimal priceUsd, PriceSource source)
    {
        if (priceUsd <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(priceUsd), "O preço deve ser maior que zero.");
        }

        return new PricePoint(Guid.NewGuid(), cryptocurrencyId, ToUtc(timestamp), priceUsd, source);
    }

    public void UpdatePrice(decimal priceUsd)
    {
        if (priceUsd <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(priceUsd), "O preço deve ser maior que zero.");
        }

        PriceUsd = priceUsd;
    }

    private static DateTime ToUtc(DateTime timestamp) => timestamp.Kind switch
    {
        DateTimeKind.Utc => timestamp,
        DateTimeKind.Local => timestamp.ToUniversalTime(),
        _ => DateTime.SpecifyKind(timestamp, DateTimeKind.Utc)
    };
}
