using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Common;

/// <summary>Representação de uma criptomoeda monitorada, devolvida por várias slices.</summary>
public sealed record UserCryptoResponse(
    Guid Id,
    Guid CryptocurrencyId,
    string Symbol,
    string Name,
    string CoinGeckoId,
    string? Notes,
    DateTime AddedAt)
{
    public static UserCryptoResponse From(UserCrypto userCrypto) => new(
        userCrypto.Id,
        userCrypto.CryptocurrencyId,
        userCrypto.Cryptocurrency.Symbol,
        userCrypto.Cryptocurrency.Name,
        userCrypto.Cryptocurrency.CoinGeckoId,
        userCrypto.Notes,
        userCrypto.AddedAt);
}
