using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Application.Features.TriggerPriceCollection;

namespace PucCrypto.Forecast.Api.Functions;

/// <summary>
/// Entrada agendada da slice TriggerPriceCollection. O agendamento (expressão CRON de seis
/// campos) vem da configuração CollectPricesSchedule.
/// </summary>
public sealed class CollectPricesFunction(
    ICommandHandler<TriggerPriceCollectionCommand, PriceCollectionSummary> handler,
    ILogger<CollectPricesFunction> logger)
{
    [Function("CollectPrices")]
    public async Task RunAsync([TimerTrigger("%CollectPricesSchedule%")] TimerInfo timer, CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(new TriggerPriceCollectionCommand(), cancellationToken);

        if (result.IsSuccess)
        {
            logger.LogInformation(
                "Coleta concluída: {CollectedCount} preço(s); não encontrados: {NotFound}",
                result.Value.CollectedCount,
                string.Join(", ", result.Value.NotFoundCoinGeckoIds));
        }
        else
        {
            logger.LogError("Coleta não realizada: {Error}", result.Error!.Message);
        }
    }
}
