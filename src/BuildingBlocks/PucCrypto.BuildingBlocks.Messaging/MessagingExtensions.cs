using Microsoft.Extensions.DependencyInjection;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Messaging.RabbitMq;

namespace PucCrypto.BuildingBlocks.Messaging;

public static class MessagingExtensions
{
    /// <summary>Registra o <see cref="IEventBus"/> sobre o broker configurado (RabbitMQ no ambiente local).</summary>
    public static IServiceCollection AddMessaging(this IServiceCollection services)
    {
        services.AddOptions<RabbitMqOptions>().BindConfiguration(RabbitMqOptions.SectionName);
        services.AddSingleton<IEventBus, RabbitMqEventBus>();

        return services;
    }
}
