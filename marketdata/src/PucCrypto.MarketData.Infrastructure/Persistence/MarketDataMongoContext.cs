using MongoDB.Driver;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Infrastructure.Persistence;

/// <summary>Coleções do banco do MarketData.</summary>
public sealed class MarketDataMongoContext
{
    public MarketDataMongoContext(IMongoDatabase database)
    {
        MongoMappings.Register();

        TrackedAssets = database.GetCollection<TrackedAsset>("tracked_assets");
        PricePoints = database.GetCollection<PricePoint>("price_points");
    }

    public IMongoCollection<TrackedAsset> TrackedAssets { get; }

    public IMongoCollection<PricePoint> PricePoints { get; }
}
