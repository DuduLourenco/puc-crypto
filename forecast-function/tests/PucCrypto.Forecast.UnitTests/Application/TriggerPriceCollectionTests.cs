using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Application.Features.TriggerPriceCollection;
using Xunit;

namespace PucCrypto.Forecast.UnitTests.Application;

public sealed class TriggerPriceCollectionTests
{
    [Fact]
    public async Task DevolveOResumoDaColeta()
    {
        var summary = new PriceCollectionSummary(2, ["nao-existe"]);

        var result = await new TriggerPriceCollectionHandler(new StubTrigger(summary))
            .HandleAsync(new TriggerPriceCollectionCommand(), CancellationToken.None);

        Assert.Same(summary, result.Value);
    }

    [Fact]
    public async Task MarketDataForaDoAr_DevolveIndisponivel()
    {
        var result = await new TriggerPriceCollectionHandler(new StubTrigger(null))
            .HandleAsync(new TriggerPriceCollectionCommand(), CancellationToken.None);

        Assert.Equal(ErrorType.Unavailable, result.Error!.Type);
    }

    private sealed class StubTrigger(PriceCollectionSummary? summary) : IPriceCollectionTrigger
    {
        public Task<PriceCollectionSummary> TriggerAsync(CancellationToken cancellationToken) =>
            summary is null
                ? throw new PriceCollectionUnavailableException("fora do ar (simulado)")
                : Task.FromResult(summary);
    }
}
