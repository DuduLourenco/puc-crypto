using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;

namespace PucCrypto.MarketData.Application.Features.ListTrackedAssets;

internal sealed class ListTrackedAssetsHandler(ITrackedAssetRepository trackedAssetRepository)
    : IQueryHandler<ListTrackedAssetsQuery, IReadOnlyList<TrackedAssetResponse>>
{
    public async Task<Result<IReadOnlyList<TrackedAssetResponse>>> HandleAsync(
        ListTrackedAssetsQuery query,
        CancellationToken cancellationToken)
    {
        var assets = await trackedAssetRepository.ListAsync(cancellationToken);

        return assets
            .Select(asset => new TrackedAssetResponse(asset.Id, asset.CoinGeckoId, asset.Symbol, asset.Name, asset.TrackedSince))
            .ToList();
    }
}
