using MongoDB.Driver;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Infrastructure.Persistence;

internal sealed class TrackedAssetRepository(MarketDataMongoContext context) : ITrackedAssetRepository
{
    public async Task<IReadOnlyList<TrackedAsset>> ListAsync(CancellationToken cancellationToken) =>
        await context.TrackedAssets.Find(FilterDefinition<TrackedAsset>.Empty)
            .SortBy(asset => asset.Name)
            .ToListAsync(cancellationToken);

    public async Task<TrackedAsset?> GetAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        await context.TrackedAssets.Find(asset => asset.Id == cryptocurrencyId).FirstOrDefaultAsync(cancellationToken);

    public Task UpsertAsync(TrackedAsset asset, CancellationToken cancellationToken) =>
        context.TrackedAssets.ReplaceOneAsync(
            existing => existing.Id == asset.Id,
            asset,
            new ReplaceOptions { IsUpsert = true },
            cancellationToken);

    public Task DeleteAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        context.TrackedAssets.DeleteOneAsync(asset => asset.Id == cryptocurrencyId, cancellationToken);
}
