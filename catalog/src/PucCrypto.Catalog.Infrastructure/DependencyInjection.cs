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
        // As retentativas cobrem falhas transitórias, como o Azure SQL saindo da pausa automática.
        services.AddDbContext<CatalogDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("Database"),
                sqlServer => sqlServer.EnableRetryOnFailure()));

        services.AddScoped<ICryptocurrencyRepository, CryptocurrencyRepository>();
        services.AddScoped<IUserCryptoRepository, UserCryptoRepository>();

        services.AddMessaging();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
