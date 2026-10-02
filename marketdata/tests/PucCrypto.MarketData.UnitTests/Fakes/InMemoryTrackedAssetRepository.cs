using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.UnitTests.Fakes;

internal sealed class InMemoryTrackedAssetRepository : ITrackedAssetRepository
{
    public List<TrackedAsset> Items { get; } = [];

    public Task<IReadOnlyList<TrackedAsset>> ListAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<TrackedAsset>>(Items.ToList());

    public Task<TrackedAsset?> GetAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        Task.FromResult(Items.SingleOrDefault(item => item.Id == cryptocurrencyId));

    public Task UpsertAsync(TrackedAsset asset, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.Id == asset.Id);
        Items.Add(asset);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Guid cryptocurrencyId, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.Id == cryptocurrencyId);
        return Task.CompletedTask;
    }
}
