using System.Text.Json;
using Microsoft.Extensions.Options;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using RabbitMQ.Client;

namespace PucCrypto.BuildingBlocks.Messaging.RabbitMq;

/// <summary>
/// Publica eventos em uma exchange topic do RabbitMQ. A chave de roteamento é o
/// nome do tipo do evento e o corpo é o evento em JSON, sem envelope.
/// </summary>
internal sealed class RabbitMqEventBus(IOptions<RabbitMqOptions> options) : IEventBus, IAsyncDisposable
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    // Confirmação do broker: a publicação só termina quando o RabbitMQ aceita a mensagem.
    private static readonly CreateChannelOptions ChannelOptions = new(
        publisherConfirmationsEnabled: true,
        publisherConfirmationTrackingEnabled: true);

    private readonly RabbitMqOptions _options = options.Value;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);
    private IConnection? _connection;

    public async Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken)
        where TEvent : class
    {
        var eventName = typeof(TEvent).Name;
        var body = JsonSerializer.SerializeToUtf8Bytes(integrationEvent, SerializerOptions);

        var connection = await GetConnectionAsync(cancellationToken);
        await using var channel = await connection.CreateChannelAsync(ChannelOptions, cancellationToken);

        await channel.ExchangeDeclareAsync(
            _options.Exchange,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            cancellationToken: cancellationToken);

        var properties = new BasicProperties
        {
            ContentType = "application/json",
            DeliveryMode = DeliveryModes.Persistent,
            MessageId = Guid.NewGuid().ToString(),
            Type = eventName,
            Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
        };

        await channel.BasicPublishAsync(
            _options.Exchange,
            routingKey: eventName,
            mandatory: false,
            basicProperties: properties,
            body: body,
            cancellationToken: cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection is not null)
        {
            await _connection.DisposeAsync();
        }

        _connectionLock.Dispose();
    }

    private async Task<IConnection> GetConnectionAsync(CancellationToken cancellationToken)
    {
        if (_connection is { IsOpen: true })
        {
            return _connection;
        }

        await _connectionLock.WaitAsync(cancellationToken);
        try
        {
            if (_connection is { IsOpen: true })
            {
                return _connection;
            }

            var factory = new ConnectionFactory { Uri = new Uri(_options.Uri) };

            _connection = await factory.CreateConnectionAsync(cancellationToken);

            return _connection;
        }
        finally
        {
            _connectionLock.Release();
        }
    }
}
