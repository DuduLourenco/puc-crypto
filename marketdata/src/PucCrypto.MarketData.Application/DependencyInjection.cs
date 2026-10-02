using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.MarketData.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddEndpoints(assembly);
        services.AddHandlers(assembly);
        services.AddValidatorsFromAssembly(assembly, includeInternalTypes: true);
        services.AddEventConsumers(assembly);

        return services;
    }
}
