namespace PucCrypto.BuildingBlocks.Abstractions.Events;

/// <summary>
/// Porta de publicação de eventos de integração. O nome do tipo do evento
/// identifica a mensagem no broker (RabbitMQ local, Azure Service Bus na nuvem).
/// </summary>
public interface IEventBus
{
    Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken)
        where TEvent : class;
}
