using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PucCrypto.BuildingBlocks.Messaging;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Infrastructure.Persistence;
using PucCrypto.Catalog.Infrastructure.Persistence.Repositories;

namespace PucCrypto.Catalog.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<CatalogDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Database")));

        services.AddScoped<ICryptocurrencyRepository, CryptocurrencyRepository>();
        services.AddScoped<IUserCryptoRepository, UserCryptoRepository>();

        services.AddMessaging();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
