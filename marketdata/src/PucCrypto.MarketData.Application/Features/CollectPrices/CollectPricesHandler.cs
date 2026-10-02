using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;
using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.Application.Features.CollectPrices;

/// <summary>Coleta o preço atual de todos os ativos acompanhados e publica PricesIngested para cada um.</summary>
internal sealed class CollectPricesHandler(
    ITrackedAssetRepository trackedAssetRepository,
    IPricePointRepository pricePointRepository,
    IMarketPriceProvider marketPriceProvider,
    IEventBus eventBus,
    TimeProvider timeProvider) : ICommandHandler<CollectPricesCommand, CollectPricesResponse>
{
    private static readonly Error ProviderUnavailable = Error.Unavailable(
        "MarketData.PriceProviderUnavailable",
        "A API de preços não respondeu. Tente novamente mais tarde.");

    public async Task<Result<CollectPricesResponse>> HandleAsync(
        CollectPricesCommand command,
        CancellationToken cancellationToken)
    {
        var assets = await trackedAssetRepository.ListAsync(cancellationToken);

        if (assets.Count == 0)
        {
            return new CollectPricesResponse([], []);
        }

        IReadOnlyDictionary<string, MarketPrice> prices;
        try
        {
            prices = await marketPriceProvider.GetCurrentPricesAsync(
                assets.Select(asset => asset.CoinGeckoId).ToList(),
                cancellationToken);
        }
        catch (MarketPriceUnavailableException)
        {
            return ProviderUnavailable;
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var collected = new List<CollectedPrice>();
        var notFound = new List<string>();

        foreach (var asset in assets)
        {
            if (!prices.TryGetValue(asset.CoinGeckoId, out var price))
            {
                notFound.Add(asset.CoinGeckoId);
                continue;
            }

            var pricePoint = PricePoint.Create(asset.Id, price.Timestamp, price.PriceUsd, PriceSource.CoinGecko);

            await pricePointRepository.UpsertManyAsync([pricePoint], cancellationToken);
            await PricesIngestedPublisher.PublishAsync(eventBus, asset, [pricePoint], now, cancellationToken);

            collected.Add(new CollectedPrice(asset.Id, asset.CoinGeckoId, pricePoint.PriceUsd, pricePoint.Timestamp));
        }

        return new CollectPricesResponse(collected, notFound);
    }
}
