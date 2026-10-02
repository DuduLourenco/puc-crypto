using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Common;

/// <summary>Representação de uma criptomoeda do catálogo, devolvida por várias slices.</summary>
public sealed record CryptoResponse(Guid Id, string Symbol, string Name, string CoinGeckoId, DateTime CreatedAt)
{
    public static CryptoResponse From(Cryptocurrency cryptocurrency) => new(
        cryptocurrency.Id,
        cryptocurrency.Symbol,
        cryptocurrency.Name,
        cryptocurrency.CoinGeckoId,
        cryptocurrency.CreatedAt);
}
