namespace PucCrypto.MarketData.Application.Features.ListTrackedAssets;

public sealed record TrackedAssetResponse(Guid CryptocurrencyId, string CoinGeckoId, string Symbol, string Name, DateTime TrackedSince);
