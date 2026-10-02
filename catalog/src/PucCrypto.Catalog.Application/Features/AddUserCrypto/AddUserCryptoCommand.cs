namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

public sealed record AddUserCryptoCommand(Guid UserId, Guid CryptocurrencyId, string? Notes);
