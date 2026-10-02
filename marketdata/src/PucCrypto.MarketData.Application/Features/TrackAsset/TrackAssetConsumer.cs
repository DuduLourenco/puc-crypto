using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.IntegrationEvents;

namespace PucCrypto.MarketData.Application.Features.TrackAsset;

/// <summary>Entrada da slice pelo evento CryptoRegistered, publicado pelo Catalog.</summary>
internal sealed class TrackAssetConsumer(ICommandHandler<TrackAssetCommand> handler) : IEventConsumer<CryptoRegistered>
{
    public Task ConsumeAsync(CryptoRegistered integrationEvent, CancellationToken cancellationToken) =>
        handler.HandleAsync(
            new TrackAssetCommand(
                integrationEvent.CryptocurrencyId,
                integrationEvent.CoinGeckoId,
                integrationEvent.Symbol,
                integrationEvent.Name),
            cancellationToken);
}
