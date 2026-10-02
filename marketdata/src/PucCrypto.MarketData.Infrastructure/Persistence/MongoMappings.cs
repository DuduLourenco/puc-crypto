using System.Reflection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Infrastructure.Persistence;

/// <summary>
/// Mapeia as entidades do Domain para documentos do MongoDB sem colocar atributos
/// do driver no Domain. As entidades são reconstruídas pelos seus construtores privados.
/// </summary>
internal static class MongoMappings
{
    private static readonly object Lock = new();
    private static bool _registered;

    public static void Register()
    {
        lock (Lock)
        {
            if (_registered)
            {
                return;
            }

            BsonSerializer.TryRegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

            BsonClassMap.TryRegisterClassMap<TrackedAsset>(map =>
            {
                map.MapIdMember(asset => asset.Id);
                map.MapMember(asset => asset.CoinGeckoId).SetElementName("coinGeckoId");
                map.MapMember(asset => asset.Symbol).SetElementName("symbol");
                map.MapMember(asset => asset.Name).SetElementName("name");
                map.MapMember(asset => asset.TrackedSince).SetElementName("trackedSince");
                map.MapConstructor(PrivateConstructor<TrackedAsset>(), "Id", "CoinGeckoId", "Symbol", "Name", "TrackedSince");
            });

            BsonClassMap.TryRegisterClassMap<PricePoint>(map =>
            {
                map.MapIdMember(pricePoint => pricePoint.Id);
                map.MapMember(pricePoint => pricePoint.CryptocurrencyId).SetElementName("cryptocurrencyId");
                map.MapMember(pricePoint => pricePoint.Timestamp).SetElementName("timestamp");
                map.MapMember(pricePoint => pricePoint.PriceUsd).SetElementName("priceUsd")
                    .SetSerializer(new DecimalSerializer(BsonType.Decimal128));
                map.MapMember(pricePoint => pricePoint.Source).SetElementName("source")
                    .SetSerializer(new EnumSerializer<PriceSource>(BsonType.String));
                map.MapConstructor(PrivateConstructor<PricePoint>(), "Id", "CryptocurrencyId", "Timestamp", "PriceUsd", "Source");
            });

            _registered = true;
        }
    }

    private static ConstructorInfo PrivateConstructor<T>() =>
        typeof(T).GetConstructors(BindingFlags.Instance | BindingFlags.NonPublic).Single();
}
