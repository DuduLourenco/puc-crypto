namespace PucCrypto.BuildingBlocks.Messaging.RabbitMq;

public sealed class RabbitMqOptions
{
    public const string SectionName = "RabbitMq";

    /// <summary>
    /// Endereço do broker no formato amqp://usuario:senha@host:porta/vhost.
    /// O esquema amqps:// ativa TLS, usado pelo broker gerenciado na nuvem.
    /// </summary>
    public string Uri { get; init; } = string.Empty;

    /// <summary>Exchange do tipo topic que recebe todos os eventos do sistema.</summary>
    public string Exchange { get; init; } = "puccrypto.events";
}
