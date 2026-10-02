namespace PucCrypto.Catalog.Application.Features.UpdateLatestPrice;

public sealed record UpdateLatestPriceCommand(Guid CryptocurrencyId, decimal PriceUsd, DateTime At);
