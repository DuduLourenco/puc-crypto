using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Infrastructure.Persistence;

public static class MongoIndexExtensions
{
    /// <summary>Cria os índices das coleções; é idempotente e roda na inicialização da API.</summary>
    public static async Task EnsureMongoIndexesAsync(this IServiceProvider services)
    {
        var context = services.GetRequiredService<MarketDataMongoContext>();

        // Um preço por criptomoeda e instante; também atende a consulta do histórico.
        await context.PricePoints.Indexes.CreateOneAsync(new CreateIndexModel<PricePoint>(
            Builders<PricePoint>.IndexKeys.Ascending(pricePoint => pricePoint.CryptocurrencyId).Ascending(pricePoint => pricePoint.Timestamp),
            new CreateIndexOptions { Unique = true, Name = "ux_cryptocurrency_timestamp" }));

        await context.TrackedAssets.Indexes.CreateOneAsync(new CreateIndexModel<TrackedAsset>(
            Builders<TrackedAsset>.IndexKeys.Ascending(asset => asset.CoinGeckoId),
            new CreateIndexOptions { Unique = true, Name = "ux_coingecko_id" }));
    }
}
