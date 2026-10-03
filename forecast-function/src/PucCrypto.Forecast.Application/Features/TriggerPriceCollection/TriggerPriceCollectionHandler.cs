using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Forecast.Application.Abstractions;

namespace PucCrypto.Forecast.Application.Features.TriggerPriceCollection;

/// <summary>Pede ao MarketData a coleta dos preços atuais; acionado pela Function agendada.</summary>
internal sealed class TriggerPriceCollectionHandler(IPriceCollectionTrigger priceCollectionTrigger)
    : ICommandHandler<TriggerPriceCollectionCommand, PriceCollectionSummary>
{
    private static readonly Error MarketDataUnavailable = Error.Unavailable(
        "Forecast.MarketDataUnavailable",
        "O MarketData não respondeu ao pedido de coleta.");

    public async Task<Result<PriceCollectionSummary>> HandleAsync(
        TriggerPriceCollectionCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            return await priceCollectionTrigger.TriggerAsync(cancellationToken);
        }
        catch (PriceCollectionUnavailableException)
        {
            return MarketDataUnavailable;
        }
    }
}
