using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Infrastructure.MachineLearning;
using PucCrypto.Forecast.Infrastructure.MarketData;

namespace PucCrypto.Forecast.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IForecastModel, LagRegressionForecastModel>();

        services.AddOptions<MarketDataOptions>().BindConfiguration(MarketDataOptions.SectionName);
        services.AddHttpClient<IPriceCollectionTrigger, MarketDataCollectionClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<MarketDataOptions>>().Value;

            if (Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out var baseUrl))
            {
                client.BaseAddress = baseUrl;
            }

            client.Timeout = TimeSpan.FromSeconds(60);
            client.DefaultRequestHeaders.Add("X-Api-Key", options.CollectorApiKey);
        });

        return services;
    }
}
