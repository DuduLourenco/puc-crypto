using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.IntegrationEvents;

namespace PucCrypto.Catalog.Application.Features.UpdateLatestPrice;

/// <summary>Entrada da slice pelo evento PricesIngested, publicado pelo MarketData.</summary>
internal sealed class UpdateLatestPriceConsumer(ICommandHandler<UpdateLatestPriceCommand> handler)
    : IEventConsumer<PricesIngested>
{
    public Task ConsumeAsync(PricesIngested integrationEvent, CancellationToken cancellationToken) =>
        handler.HandleAsync(
            new UpdateLatestPriceCommand(
                integrationEvent.CryptocurrencyId,
                integrationEvent.LatestPriceUsd,
                integrationEvent.LatestTimestamp),
            cancellationToken);
}
