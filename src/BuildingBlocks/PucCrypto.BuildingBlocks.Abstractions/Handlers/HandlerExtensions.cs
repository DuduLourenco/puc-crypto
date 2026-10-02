using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace PucCrypto.BuildingBlocks.Abstractions.Handlers;

public static class HandlerExtensions
{
    private static readonly Type[] HandlerContracts = [typeof(ICommandHandler<,>), typeof(IQueryHandler<,>)];

    /// <summary>Registra todos os handlers de command e query do assembly.</summary>
    public static IServiceCollection AddHandlers(this IServiceCollection services, Assembly assembly)
    {
        foreach (var type in assembly.DefinedTypes.Where(type => type is { IsAbstract: false, IsInterface: false }))
        {
            var contracts = type.ImplementedInterfaces.Where(contract =>
                contract.IsGenericType && HandlerContracts.Contains(contract.GetGenericTypeDefinition()));

            foreach (var contract in contracts)
            {
                services.AddScoped(contract, type);
            }
        }

        return services;
    }
}
