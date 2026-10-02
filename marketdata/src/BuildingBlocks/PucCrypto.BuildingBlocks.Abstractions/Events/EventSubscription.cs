namespace PucCrypto.BuildingBlocks.Abstractions.Events;

/// <summary>
/// Inscrição de um serviço em um evento. O adaptador do broker cria uma fila
/// por inscrição e usa <see cref="DispatchAsync"/> para entregar a mensagem.
/// </summary>
public sealed record EventSubscription(
    Type EventType,
    Func<IServiceProvider, object, CancellationToken, Task> DispatchAsync)
{
    /// <summary>Nome do evento, igual ao nome do tipo; é a chave de roteamento no broker.</summary>
    public string EventName => EventType.Name;
}
