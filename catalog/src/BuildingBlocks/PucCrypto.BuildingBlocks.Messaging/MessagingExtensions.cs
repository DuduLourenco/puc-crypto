using Microsoft.Extensions.DependencyInjection;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Messaging.RabbitMq;

namespace PucCrypto.BuildingBlocks.Messaging;

public static class MessagingExtensions
{
    /// <summary>Registra o <see cref="IEventBus"/> sobre o RabbitMQ configurado em RabbitMq:Uri.</summary>
    public static IServiceCollection AddMessaging(this IServiceCollection services)
    {
        services.AddOptions<RabbitMqOptions>()
            .BindConfiguration(RabbitMqOptions.SectionName)
            .Validate(
                options => Uri.TryCreate(options.Uri, UriKind.Absolute, out var uri) && uri.Scheme is "amqp" or "amqps",
                "RabbitMq:Uri deve ser um endereço amqp:// ou amqps://.")
            .ValidateOnStart();
        services.AddSingleton<IEventBus, RabbitMqEventBus>();

        return services;
    }
}
