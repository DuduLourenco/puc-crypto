namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

/// <summary>Corpo da requisição HTTP.</summary>
public sealed record AddUserCryptoRequest(Guid CryptocurrencyId, string? Notes);
