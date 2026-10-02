using PucCrypto.BuildingBlocks.Abstractions.Events;

namespace PucCrypto.MarketData.UnitTests.Fakes;

/// <summary>Guarda os eventos publicados, em ordem, em vez de enviá-los a um broker.</summary>
internal sealed class RecordingEventBus : IEventBus
{
    public List<object> Published { get; } = [];

    public Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken)
        where TEvent : class
    {
        Published.Add(integrationEvent);
        return Task.CompletedTask;
    }
}
