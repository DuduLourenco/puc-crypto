using Microsoft.Extensions.Logging;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Application.Features.TrackAsset;

/// <summary>Passa a acompanhar a criptomoeda e carrega o histórico diário inicial.</summary>
internal sealed class TrackAssetHandler(
    ITrackedAssetRepository trackedAssetRepository,
    IPricePointRepository pricePointRepository,
    IMarketPriceProvider marketPriceProvider,
    IEventBus eventBus,
    TimeProvider timeProvider,
    ILogger<TrackAssetHandler> logger) : ICommandHandler<TrackAssetCommand>
{
    public const int BackfillDays = 90;

    public async Task<Result> HandleAsync(TrackAssetCommand command, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var asset = TrackedAsset.Create(command.CryptocurrencyId, command.CoinGeckoId, command.Symbol, command.Name, now);

        await trackedAssetRepository.UpsertAsync(asset, cancellationToken);

        IReadOnlyList<MarketPrice> history;
        try
        {
            history = await marketPriceProvider.GetDailyHistoryAsync(asset.CoinGeckoId, BackfillDays, cancellationToken);
        }
        catch (MarketPriceUnavailableException exception)
        {
            // O ativo já está acompanhado: a próxima coleta traz o preço atual.
            logger.LogWarning(exception, "Histórico inicial de {CoinGeckoId} indisponível", asset.CoinGeckoId);
            return Result.Success();
        }

        var pricePoints = history
            .Select(price => PricePoint.Create(asset.Id, price.Timestamp, price.PriceUsd, PriceSource.CoinGecko))
            .ToList();

        if (pricePoints.Count > 0)
        {
            await pricePointRepository.UpsertManyAsync(pricePoints, cancellationToken);
            await PricesIngestedPublisher.PublishAsync(eventBus, asset, pricePoints, now, cancellationToken);
        }

        return Result.Success();
    }
}
