using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.Forecast.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddHandlers(assembly);
        services.AddValidatorsFromAssembly(assembly, includeInternalTypes: true);

        return services;
    }
}
