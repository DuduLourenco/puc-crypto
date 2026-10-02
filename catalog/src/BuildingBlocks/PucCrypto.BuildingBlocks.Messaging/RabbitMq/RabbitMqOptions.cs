namespace PucCrypto.BuildingBlocks.Messaging.RabbitMq;

public sealed class RabbitMqOptions
{
    public const string SectionName = "RabbitMq";

    public string Host { get; init; } = "localhost";

    public int Port { get; init; } = 5672;

    public string Username { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;

    /// <summary>Exchange do tipo topic que recebe todos os eventos do sistema.</summary>
    public string Exchange { get; init; } = "puccrypto.events";
}
