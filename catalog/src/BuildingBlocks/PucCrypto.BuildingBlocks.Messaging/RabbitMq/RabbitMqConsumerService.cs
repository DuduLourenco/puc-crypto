using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace PucCrypto.BuildingBlocks.Messaging.RabbitMq;

/// <summary>
/// Cria uma fila durável por inscrição ("servico.NomeDoEvento"), ligada à exchange
/// pelo nome do evento, e entrega cada mensagem ao consumidor da slice, em um escopo
/// de injeção de dependência próprio. Uma mensagem que falha é reentregue uma vez;
/// se falhar de novo, é descartada e registrada no log.
/// </summary>
internal sealed class RabbitMqConsumerService(
    IOptions<RabbitMqOptions> options,
    IEnumerable<EventSubscription> subscriptions,
    IServiceScopeFactory scopeFactory,
    ILogger<RabbitMqConsumerService> logger) : BackgroundService
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private static readonly TimeSpan ReconnectDelay = TimeSpan.FromSeconds(5);

    private readonly RabbitMqOptions _options = options.Value;
    private readonly EventSubscription[] _subscriptions = subscriptions.ToArray();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_subscriptions.Length == 0)
        {
            return;
        }

        await using var connection = await ConnectAsync(stoppingToken);
        await using var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);

        await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 10, global: false, stoppingToken);
        await channel.ExchangeDeclareAsync(
            _options.Exchange, ExchangeType.Topic, durable: true, autoDelete: false, cancellationToken: stoppingToken);

        foreach (var subscription in _subscriptions)
        {
            var queue = $"{_options.ServiceName}.{subscription.EventName}";

            await channel.QueueDeclareAsync(
                queue, durable: true, exclusive: false, autoDelete: false, cancellationToken: stoppingToken);
            await channel.QueueBindAsync(queue, _options.Exchange, subscription.EventName, cancellationToken: stoppingToken);

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += (_, delivery) => HandleAsync(channel, subscription, delivery, stoppingToken);

            await channel.BasicConsumeAsync(queue, autoAck: false, consumer, stoppingToken);

            logger.LogInformation("Consumindo {EventName} pela fila {Queue}", subscription.EventName, queue);
        }

        try
        {
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            // Encerramento normal do serviço.
        }
    }

    private async Task HandleAsync(
        IChannel channel,
        EventSubscription subscription,
        BasicDeliverEventArgs delivery,
        CancellationToken cancellationToken)
    {
        try
        {
            var integrationEvent = JsonSerializer.Deserialize(delivery.Body.Span, subscription.EventType, SerializerOptions)
                ?? throw new JsonException($"Mensagem {subscription.EventName} vazia.");

            await using var scope = scopeFactory.CreateAsyncScope();
            await subscription.DispatchAsync(scope.ServiceProvider, integrationEvent, cancellationToken);

            await channel.BasicAckAsync(delivery.DeliveryTag, multiple: false, cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            var requeue = !delivery.Redelivered;

            logger.LogError(
                exception,
                "Falha ao processar {EventName}; {Action}",
                subscription.EventName,
                requeue ? "a mensagem será reentregue" : "a mensagem foi descartada");

            await channel.BasicNackAsync(delivery.DeliveryTag, multiple: false, requeue, cancellationToken);
        }
    }

    private async Task<IConnection> ConnectAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory { Uri = new Uri(_options.Uri) };

        while (true)
        {
            try
            {
                return await factory.CreateConnectionAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogWarning(exception, "RabbitMQ indisponível; nova tentativa em {Delay}", ReconnectDelay);
                await Task.Delay(ReconnectDelay, stoppingToken);
            }
        }
    }
}
