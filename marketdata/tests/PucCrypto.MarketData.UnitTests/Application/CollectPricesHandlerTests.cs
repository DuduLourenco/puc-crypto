using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Features.CollectPrices;
using PucCrypto.MarketData.Application.IntegrationEvents;
using PucCrypto.MarketData.Domain.TrackedAssets;
using PucCrypto.MarketData.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.MarketData.UnitTests.Application;

public sealed class CollectPricesHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 10, 12, 0, 0, TimeSpan.Zero);

    private readonly InMemoryTrackedAssetRepository _assets = new();
    private readonly InMemoryPricePointRepository _prices = new();
    private readonly FakeMarketPriceProvider _provider = new();
    private readonly RecordingEventBus _eventBus = new();

    private CollectPricesHandler Handler => new(_assets, _prices, _provider, _eventBus, new FixedTimeProvider(Now));

    [Fact]
    public async Task ColetaCadaAtivoEPublicaUmEventoPorAtivo_EInformaOsNaoEncontrados()
    {
        var bitcoin = TrackedAsset.Create(Guid.NewGuid(), "bitcoin", "BTC", "Bitcoin", Now.UtcDateTime);
        var invalid = TrackedAsset.Create(Guid.NewGuid(), "nao-existe", "XXX", "Inexistente", Now.UtcDateTime);
        _assets.Items.AddRange([bitcoin, invalid]);
        _provider.CurrentPrices["bitcoin"] = new MarketPrice(Now.UtcDateTime.AddMinutes(-1), 65000m);

        var result = await Handler.HandleAsync(new CollectPricesCommand(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var collected = Assert.Single(result.Value.Collected);
        Assert.Equal(bitcoin.Id, collected.CryptocurrencyId);
        Assert.Equal(["nao-existe"], result.Value.NotFoundCoinGeckoIds);
        Assert.Single(_prices.Items);
        var published = Assert.IsType<PricesIngested>(Assert.Single(_eventBus.Published));
        Assert.Equal(65000m, published.LatestPriceUsd);
    }

    [Fact]
    public async Task SemAtivos_NaoConsultaAFonte()
    {
        _provider.Unavailable = true;

        var result = await Handler.HandleAsync(new CollectPricesCommand(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.Collected);
    }

    [Fact]
    public async Task FonteForaDoAr_DevolveIndisponivel()
    {
        _assets.Items.Add(TrackedAsset.Create(Guid.NewGuid(), "bitcoin", "BTC", "Bitcoin", Now.UtcDateTime));
        _provider.Unavailable = true;

        var result = await Handler.HandleAsync(new CollectPricesCommand(), CancellationToken.None);

        Assert.Equal(ErrorType.Unavailable, result.Error!.Type);
        Assert.Empty(_eventBus.Published);
    }
}
