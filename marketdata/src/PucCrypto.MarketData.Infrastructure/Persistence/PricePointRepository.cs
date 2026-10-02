using MongoDB.Driver;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.Infrastructure.Persistence;

internal sealed class PricePointRepository(MarketDataMongoContext context) : IPricePointRepository
{
    private static readonly FilterDefinitionBuilder<PricePoint> Filter = Builders<PricePoint>.Filter;

    public async Task<PricePoint?> GetAsync(Guid id, CancellationToken cancellationToken) =>
        await context.PricePoints.Find(pricePoint => pricePoint.Id == id).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<PricePoint>> ListAsync(
        Guid cryptocurrencyId,
        DateTime? from,
        DateTime? to,
        int limit,
        CancellationToken cancellationToken)
    {
        var filter = Filter.Eq(pricePoint => pricePoint.CryptocurrencyId, cryptocurrencyId);

        if (from is not null)
        {
            filter &= Filter.Gte(pricePoint => pricePoint.Timestamp, from.Value);
        }

        if (to is not null)
        {
            filter &= Filter.Lte(pricePoint => pricePoint.Timestamp, to.Value);
        }

        // Os mais recentes dentro do limite, devolvidos em ordem cronológica.
        var latest = await context.PricePoints.Find(filter)
            .SortByDescending(pricePoint => pricePoint.Timestamp)
            .Limit(limit)
            .ToListAsync(cancellationToken);

        latest.Reverse();

        return latest;
    }

    public Task<bool> ExistsAsync(Guid cryptocurrencyId, DateTime timestamp, CancellationToken cancellationToken) =>
        context.PricePoints
            .Find(pricePoint => pricePoint.CryptocurrencyId == cryptocurrencyId && pricePoint.Timestamp == timestamp)
            .AnyAsync(cancellationToken);

    public Task AddAsync(PricePoint pricePoint, CancellationToken cancellationToken) =>
        context.PricePoints.InsertOneAsync(pricePoint, cancellationToken: cancellationToken);

    public async Task UpsertManyAsync(IReadOnlyCollection<PricePoint> pricePoints, CancellationToken cancellationToken)
    {
        if (pricePoints.Count == 0)
        {
            return;
        }

        var writes = pricePoints.Select(pricePoint => new UpdateOneModel<PricePoint>(
            Filter.Eq(existing => existing.CryptocurrencyId, pricePoint.CryptocurrencyId)
                & Filter.Eq(existing => existing.Timestamp, pricePoint.Timestamp),
            Builders<PricePoint>.Update
                .SetOnInsert(existing => existing.Id, pricePoint.Id)
                .Set(existing => existing.PriceUsd, pricePoint.PriceUsd)
                .Set(existing => existing.Source, pricePoint.Source))
        {
            IsUpsert = true
        });

        await context.PricePoints.BulkWriteAsync(writes, new BulkWriteOptions { IsOrdered = false }, cancellationToken);
    }

    public Task UpdateAsync(PricePoint pricePoint, CancellationToken cancellationToken) =>
        context.PricePoints.ReplaceOneAsync(existing => existing.Id == pricePoint.Id, pricePoint, cancellationToken: cancellationToken);

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken) =>
        context.PricePoints.DeleteOneAsync(pricePoint => pricePoint.Id == id, cancellationToken);

    public Task DeleteByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        context.PricePoints.DeleteManyAsync(pricePoint => pricePoint.CryptocurrencyId == cryptocurrencyId, cancellationToken);
}
