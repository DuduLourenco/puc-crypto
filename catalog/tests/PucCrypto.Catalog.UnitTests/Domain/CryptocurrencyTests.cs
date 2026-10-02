using PucCrypto.Catalog.Domain.Cryptocurrencies;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Domain;

public sealed class CryptocurrencyTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_NormalizaSimboloNomeEIdentificadorDaCoinGecko()
    {
        var cryptocurrency = Cryptocurrency.Create(" btc ", " Bitcoin ", " BitCoin ", Now);

        Assert.NotEqual(Guid.Empty, cryptocurrency.Id);
        Assert.Equal("BTC", cryptocurrency.Symbol);
        Assert.Equal("Bitcoin", cryptocurrency.Name);
        Assert.Equal("bitcoin", cryptocurrency.CoinGeckoId);
        Assert.Equal(Now, cryptocurrency.CreatedAt);
    }

    [Fact]
    public void Update_AlteraSimboloENome_MasNaoOIdentificadorDaCoinGecko()
    {
        var cryptocurrency = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now);

        cryptocurrency.Update(" xbt ", " Bitcoin (XBT) ");

        Assert.Equal("XBT", cryptocurrency.Symbol);
        Assert.Equal("Bitcoin (XBT)", cryptocurrency.Name);
        Assert.Equal("bitcoin", cryptocurrency.CoinGeckoId);
    }
}
