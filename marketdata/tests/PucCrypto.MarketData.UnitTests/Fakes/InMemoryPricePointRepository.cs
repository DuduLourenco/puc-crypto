using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.UnitTests.Fakes;

internal sealed class InMemoryPricePointRepository : IPricePointRepository
{
    public List<PricePoint> Items { get; } = [];

    public Task<PricePoint?> GetAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(Items.SingleOrDefault(item => item.Id == id));

    public Task<IReadOnlyList<PricePoint>> ListAsync(
        Guid cryptocurrencyId, DateTime? from, DateTime? to, int limit, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<PricePoint>>(Items
            .Where(item => item.CryptocurrencyId == cryptocurrencyId)
            .Where(item => from is null || item.Timestamp >= from)
            .Where(item => to is null || item.Timestamp <= to)
            .OrderByDescending(item => item.Timestamp)
            .Take(limit)
            .OrderBy(item => item.Timestamp)
            .ToList());

    public Task<bool> ExistsAsync(Guid cryptocurrencyId, DateTime timestamp, CancellationToken cancellationToken) =>
        Task.FromResult(Items.Any(item => item.CryptocurrencyId == cryptocurrencyId && item.Timestamp == timestamp));

    public Task AddAsync(PricePoint pricePoint, CancellationToken cancellationToken)
    {
        Items.Add(pricePoint);
        return Task.CompletedTask;
    }

    public Task UpsertManyAsync(IReadOnlyCollection<PricePoint> pricePoints, CancellationToken cancellationToken)
    {
        foreach (var pricePoint in pricePoints)
        {
            Items.RemoveAll(item => item.CryptocurrencyId == pricePoint.CryptocurrencyId && item.Timestamp == pricePoint.Timestamp);
            Items.Add(pricePoint);
        }

        return Task.CompletedTask;
    }

    public Task UpdateAsync(PricePoint pricePoint, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }

    public Task DeleteByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken)
    {
        Items.RemoveAll(item => item.CryptocurrencyId == cryptocurrencyId);
        return Task.CompletedTask;
    }
}
