namespace PucCrypto.MarketData.Application.Features.CreatePricePoint;

public sealed record CreatePricePointCommand(Guid CryptocurrencyId, DateTime Timestamp, decimal PriceUsd);
