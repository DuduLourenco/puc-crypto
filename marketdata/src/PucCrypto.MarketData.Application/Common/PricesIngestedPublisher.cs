using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.MarketData.Application.IntegrationEvents;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Application.Common;

/// <summary>Publica PricesIngested para os preços coletados de um ativo; usado pelas slices de coleta.</summary>
public static class PricesIngestedPublisher
{
    public static Task PublishAsync(
        IEventBus eventBus,
        TrackedAsset asset,
        IReadOnlyCollection<PricePoint> pricePoints,
        DateTime occurredAt,
        CancellationToken cancellationToken)
    {
        var latest = pricePoints.MaxBy(pricePoint => pricePoint.Timestamp)!;

        return eventBus.PublishAsync(
            new PricesIngested(asset.Id, asset.CoinGeckoId, pricePoints.Count, latest.PriceUsd, latest.Timestamp, occurredAt),
            cancellationToken);
    }
}
