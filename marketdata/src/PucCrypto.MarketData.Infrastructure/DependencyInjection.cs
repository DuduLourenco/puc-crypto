using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PucCrypto.BuildingBlocks.Messaging;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Infrastructure.CoinGecko;
using PucCrypto.MarketData.Infrastructure.Persistence;

namespace PucCrypto.MarketData.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("ConnectionStrings:Database não configurada.");
        var databaseName = configuration["Mongo:DatabaseName"] ?? "marketdata";

        services.AddSingleton<IMongoClient>(new MongoClient(connectionString));
        services.AddSingleton(provider => provider.GetRequiredService<IMongoClient>().GetDatabase(databaseName));
        services.AddSingleton<MarketDataMongoContext>();

        services.AddScoped<ITrackedAssetRepository, TrackedAssetRepository>();
        services.AddScoped<IPricePointRepository, PricePointRepository>();

        services.AddOptions<CoinGeckoOptions>().BindConfiguration(CoinGeckoOptions.SectionName);
        services.AddHttpClient<IMarketPriceProvider, CoinGeckoClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<CoinGeckoOptions>>().Value;

            client.BaseAddress = new Uri(options.BaseUrl);
            client.Timeout = TimeSpan.FromSeconds(20);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("PucCrypto-MarketData/1.0");

            if (!string.IsNullOrWhiteSpace(options.ApiKey))
            {
                client.DefaultRequestHeaders.Add("x-cg-demo-api-key", options.ApiKey);
            }
        });

        services.AddMessaging();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
