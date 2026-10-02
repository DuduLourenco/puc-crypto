namespace PucCrypto.BuildingBlocks.Abstractions.Events;

/// <summary>
/// Ponto de entrada de uma slice acionada por um evento de integração, assim
/// como o endpoint é o ponto de entrada de uma slice acionada por HTTP.
/// </summary>
public interface IEventConsumer<in TEvent>
    where TEvent : class
{
    Task ConsumeAsync(TEvent integrationEvent, CancellationToken cancellationToken);
}
