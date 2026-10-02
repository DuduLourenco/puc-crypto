namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

/// <summary>Corpo da requisição HTTP.</summary>
public sealed record AddUserCryptoRequest(string CoinGeckoId, string Symbol, string Name, string? Notes);
