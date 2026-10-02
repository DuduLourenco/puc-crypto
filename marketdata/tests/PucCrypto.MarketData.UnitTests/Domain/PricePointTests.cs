using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;
using Xunit;

namespace PucCrypto.MarketData.UnitTests.Domain;

public sealed class PricePointTests
{
    [Fact]
    public void Create_GuardaOInstanteEmUtc()
    {
        var unspecified = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Unspecified);

        var pricePoint = PricePoint.Create(Guid.NewGuid(), unspecified, 10m, PriceSource.Manual);

        Assert.Equal(DateTimeKind.Utc, pricePoint.Timestamp.Kind);
        Assert.Equal(unspecified.Ticks, pricePoint.Timestamp.Ticks);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void PrecoPrecisaSerPositivo(decimal price)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            PricePoint.Create(Guid.NewGuid(), DateTime.UtcNow, price, PriceSource.Manual));

        var pricePoint = PricePoint.Create(Guid.NewGuid(), DateTime.UtcNow, 1m, PriceSource.Manual);
        Assert.Throws<ArgumentOutOfRangeException>(() => pricePoint.UpdatePrice(price));
    }

    [Fact]
    public void TrackedAsset_UsaOIdDoCatalogENormalizaOsCampos()
    {
        var cryptocurrencyId = Guid.NewGuid();

        var asset = TrackedAsset.Create(cryptocurrencyId, " BitCoin ", " btc ", " Bitcoin ", DateTime.UtcNow);

        Assert.Equal(cryptocurrencyId, asset.Id);
        Assert.Equal("bitcoin", asset.CoinGeckoId);
        Assert.Equal("BTC", asset.Symbol);
        Assert.Equal("Bitcoin", asset.Name);
    }
}
