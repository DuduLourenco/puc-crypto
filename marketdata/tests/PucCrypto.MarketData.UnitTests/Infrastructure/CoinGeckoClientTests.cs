using System.Net;
using System.Text;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Infrastructure.CoinGecko;
using Xunit;

namespace PucCrypto.MarketData.UnitTests.Infrastructure;

/// <summary>Leitura das respostas da CoinGecko, com um HttpMessageHandler que devolve respostas fixas.</summary>
public sealed class CoinGeckoClientTests
{
    [Fact]
    public async Task GetCurrentPrices_LePrecoEInstante_EIgnoraIdsDesconhecidos()
    {
        var client = Client(HttpStatusCode.OK, """{"bitcoin":{"usd":65000.12,"last_updated_at":1767268800}}""", out var handler);

        var prices = await client.GetCurrentPricesAsync(["bitcoin", "nao-existe"], CancellationToken.None);

        var bitcoin = Assert.Single(prices);
        Assert.Equal("bitcoin", bitcoin.Key);
        Assert.Equal(new MarketPrice(new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc), 65000.12m), bitcoin.Value);
        Assert.Contains("simple/price?ids=bitcoin%2Cnao-existe&vs_currencies=usd", handler.LastRequest!.RequestUri!.ToString());
    }

    [Fact]
    public async Task GetDailyHistory_LeAListaDePrecos()
    {
        var client = Client(HttpStatusCode.OK, """{"prices":[[1767225600000,64000.5],[1767312000000,65000]]}""", out var handler);

        var history = await client.GetDailyHistoryAsync("bitcoin", 90, CancellationToken.None);

        Assert.Equal(2, history.Count);
        Assert.Equal(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), history[0].Timestamp);
        Assert.Equal(64000.5m, history[0].PriceUsd);
        Assert.Contains("coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily", handler.LastRequest!.RequestUri!.ToString());
    }

    [Fact]
    public async Task GetDailyHistory_MoedaInexistente_DevolveListaVazia()
    {
        var client = Client(HttpStatusCode.NotFound, """{"error":"coin not found"}""", out _);

        Assert.Empty(await client.GetDailyHistoryAsync("nao-existe", 90, CancellationToken.None));
    }

    [Theory]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    public async Task FalhaDaApi_ViraIndisponibilidade(HttpStatusCode status)
    {
        var client = Client(status, "{}", out _);

        await Assert.ThrowsAsync<MarketPriceUnavailableException>(() =>
            client.GetCurrentPricesAsync(["bitcoin"], CancellationToken.None));
    }

    private static CoinGeckoClient Client(HttpStatusCode status, string body, out StubHandler handler)
    {
        handler = new StubHandler(status, body);
        return new CoinGeckoClient(new HttpClient(handler) { BaseAddress = new Uri("https://api.coingecko.com/api/v3/") });
    }

    private sealed class StubHandler(HttpStatusCode status, string body) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequest = request;
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json")
            });
        }
    }
}
