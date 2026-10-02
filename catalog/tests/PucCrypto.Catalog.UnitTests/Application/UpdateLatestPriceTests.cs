using PucCrypto.Catalog.Application.Features.UpdateLatestPrice;
using PucCrypto.Catalog.Application.IntegrationEvents;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Application;

/// <summary>Slice UpdateLatestPrice, acionada pelo evento PricesIngested.</summary>
public sealed class UpdateLatestPriceTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    private readonly InMemoryCryptocurrencyRepository _cryptocurrencies = new();
    private readonly Cryptocurrency _bitcoin = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now);

    public UpdateLatestPriceTests() => _cryptocurrencies.Items.Add(_bitcoin);

    private UpdateLatestPriceConsumer Consumer => new(new UpdateLatestPriceHandler(_cryptocurrencies));

    [Fact]
    public async Task GuardaOPrecoRecebidoNoEvento()
    {
        await Consumer.ConsumeAsync(new PricesIngested(_bitcoin.Id, "bitcoin", 1, 65000.5m, Now, Now), CancellationToken.None);

        Assert.Equal(65000.5m, _bitcoin.LatestPriceUsd);
        Assert.Equal(Now, _bitcoin.LatestPriceAt);
        Assert.Equal(1, _cryptocurrencies.Updates);
    }

    [Fact]
    public async Task IgnoraPrecoMaisAntigoQueOAtual()
    {
        await Consumer.ConsumeAsync(new PricesIngested(_bitcoin.Id, "bitcoin", 1, 65000m, Now, Now), CancellationToken.None);
        await Consumer.ConsumeAsync(new PricesIngested(_bitcoin.Id, "bitcoin", 90, 40000m, Now.AddDays(-1), Now), CancellationToken.None);

        Assert.Equal(65000m, _bitcoin.LatestPriceUsd);
        Assert.Equal(1, _cryptocurrencies.Updates);
    }

    [Fact]
    public async Task IgnoraCriptomoedaQueNaoEstaMaisNoCatalogo()
    {
        await Consumer.ConsumeAsync(new PricesIngested(Guid.NewGuid(), "removida", 1, 1m, Now, Now), CancellationToken.None);

        Assert.Equal(0, _cryptocurrencies.Updates);
    }
}
