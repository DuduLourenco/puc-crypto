namespace PucCrypto.Catalog.Application.Features.CreateCrypto;

public sealed record CreateCryptoCommand(string CoinGeckoId, string Symbol, string Name);
