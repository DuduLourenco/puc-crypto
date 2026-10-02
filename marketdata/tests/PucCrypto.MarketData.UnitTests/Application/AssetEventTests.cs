using Microsoft.Extensions.Logging.Abstractions;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Features.TrackAsset;
using PucCrypto.MarketData.Application.Features.UntrackAsset;
using PucCrypto.MarketData.Application.IntegrationEvents;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;
using PucCrypto.MarketData.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.MarketData.UnitTests.Application;

/// <summary>Slices acionadas pelos eventos do Catalog: TrackAsset (CryptoRegistered) e UntrackAsset (CryptoRemoved).</summary>
public sealed class AssetEventTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly Guid BitcoinId = Guid.NewGuid();

    private readonly InMemoryTrackedAssetRepository _assets = new();
    private readonly InMemoryPricePointRepository _prices = new();
    private readonly FakeMarketPriceProvider _provider = new();
    private readonly RecordingEventBus _eventBus = new();

    private TrackAssetConsumer TrackConsumer => new(new TrackAssetHandler(
        _assets, _prices, _provider, _eventBus, new FixedTimeProvider(Now), NullLogger<TrackAssetHandler>.Instance));

    private static CryptoRegistered Registered => new(BitcoinId, "BTC", "Bitcoin", "bitcoin", Now.UtcDateTime);

    [Fact]
    public async Task CryptoRegistered_AcompanhaOAtivoCarregaOHistoricoEPublicaPricesIngested()
    {
        _provider.History["bitcoin"] =
        [
            new MarketPrice(Now.UtcDateTime.AddDays(-2), 60000m),
            new MarketPrice(Now.UtcDateTime.AddDays(-1), 61000m),
            new MarketPrice(Now.UtcDateTime, 62000m)
        ];

        await TrackConsumer.ConsumeAsync(Registered, CancellationToken.None);

        var asset = Assert.Single(_assets.Items);
        Assert.Equal(BitcoinId, asset.Id);
        Assert.Equal(3, _prices.Items.Count);
        Assert.All(_prices.Items, price => Assert.Equal(PriceSource.CoinGecko, price.Source));
        var published = Assert.IsType<PricesIngested>(Assert.Single(_eventBus.Published));
        Assert.Equal(new PricesIngested(BitcoinId, "bitcoin", 3, 62000m, Now.UtcDateTime, Now.UtcDateTime), published);
    }

    [Fact]
    public async Task CryptoRegistered_RepetidoNaoDuplicaDados()
    {
        _provider.History["bitcoin"] = [new MarketPrice(Now.UtcDateTime, 62000m)];

        await TrackConsumer.ConsumeAsync(Registered, CancellationToken.None);
        await TrackConsumer.ConsumeAsync(Registered, CancellationToken.None);

        Assert.Single(_assets.Items);
        Assert.Single(_prices.Items);
    }

    [Fact]
    public async Task CryptoRegistered_ComCoinGeckoForaDoAr_AcompanhaOAtivoSemHistorico()
    {
        _provider.Unavailable = true;

        await TrackConsumer.ConsumeAsync(Registered, CancellationToken.None);

        Assert.Single(_assets.Items);
        Assert.Empty(_prices.Items);
        Assert.Empty(_eventBus.Published);
    }

    [Fact]
    public async Task CryptoRemoved_ApagaOAtivoEOHistorico()
    {
        _assets.Items.Add(TrackedAsset.Create(BitcoinId, "bitcoin", "BTC", "Bitcoin", Now.UtcDateTime));
        _prices.Items.Add(PricePoint.Create(BitcoinId, Now.UtcDateTime, 1m, PriceSource.CoinGecko));
        var otherAsset = Guid.NewGuid();
        _prices.Items.Add(PricePoint.Create(otherAsset, Now.UtcDateTime, 1m, PriceSource.CoinGecko));

        await new UntrackAssetConsumer(new UntrackAssetHandler(_assets, _prices))
            .ConsumeAsync(new CryptoRemoved(BitcoinId, "bitcoin", Now.UtcDateTime), CancellationToken.None);

        Assert.Empty(_assets.Items);
        Assert.Equal(otherAsset, Assert.Single(_prices.Items).CryptocurrencyId);
    }
}
