using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.IntegrationEvents;

namespace PucCrypto.MarketData.Application.Features.UntrackAsset;

/// <summary>Entrada da slice pelo evento CryptoRemoved, publicado pelo Catalog.</summary>
internal sealed class UntrackAssetConsumer(ICommandHandler<UntrackAssetCommand> handler) : IEventConsumer<CryptoRemoved>
{
    public Task ConsumeAsync(CryptoRemoved integrationEvent, CancellationToken cancellationToken) =>
        handler.HandleAsync(new UntrackAssetCommand(integrationEvent.CryptocurrencyId), cancellationToken);
}
