namespace PucCrypto.MarketData.Application.Features.TrackAsset;

public sealed record TrackAssetCommand(Guid CryptocurrencyId, string CoinGeckoId, string Symbol, string Name);
