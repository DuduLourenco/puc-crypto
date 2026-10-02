namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

public sealed record AddUserCryptoCommand(Guid UserId, string CoinGeckoId, string Symbol, string Name, string? Notes);
