using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace PucCrypto.BuildingBlocks.Abstractions.Events;

public static class EventConsumerExtensions
{
    /// <summary>Registra todos os consumidores de eventos (<see cref="IEventConsumer{TEvent}"/>) do assembly.</summary>
    public static IServiceCollection AddEventConsumers(this IServiceCollection services, Assembly assembly)
    {
        var register = typeof(EventConsumerExtensions).GetMethod(nameof(AddEventConsumer))!;

        foreach (var type in assembly.DefinedTypes.Where(type => type is { IsAbstract: false, IsInterface: false }))
        {
            var contracts = type.ImplementedInterfaces.Where(contract =>
                contract.IsGenericType && contract.GetGenericTypeDefinition() == typeof(IEventConsumer<>));

            foreach (var contract in contracts)
            {
                register.MakeGenericMethod(contract.GetGenericArguments()[0], type).Invoke(null, [services]);
            }
        }

        return services;
    }

    public static IServiceCollection AddEventConsumer<TEvent, TConsumer>(this IServiceCollection services)
        where TEvent : class
        where TConsumer : class, IEventConsumer<TEvent>
    {
        services.AddScoped<IEventConsumer<TEvent>, TConsumer>();
        services.AddSingleton(new EventSubscription(
            typeof(TEvent),
            (provider, integrationEvent, cancellationToken) => provider
                .GetRequiredService<IEventConsumer<TEvent>>()
                .ConsumeAsync((TEvent)integrationEvent, cancellationToken)));

        return services;
    }
}
