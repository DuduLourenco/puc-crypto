using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.Application.Common;

/// <summary>Representação de um preço, devolvida por várias slices.</summary>
public sealed record PricePointResponse(Guid Id, Guid CryptocurrencyId, DateTime Timestamp, decimal PriceUsd, string Source)
{
    public static PricePointResponse From(PricePoint pricePoint) => new(
        pricePoint.Id,
        pricePoint.CryptocurrencyId,
        pricePoint.Timestamp,
        pricePoint.PriceUsd,
        pricePoint.Source.ToString());
}
