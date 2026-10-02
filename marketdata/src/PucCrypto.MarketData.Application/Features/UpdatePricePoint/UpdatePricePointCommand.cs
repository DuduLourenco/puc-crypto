namespace PucCrypto.MarketData.Application.Features.UpdatePricePoint;

public sealed record UpdatePricePointCommand(Guid Id, decimal PriceUsd);
