using System.Net;
using System.Text;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Infrastructure.MarketData;
using Xunit;

namespace PucCrypto.Forecast.UnitTests.Infrastructure;

public sealed class MarketDataCollectionClientTests
{
    [Fact]
    public async Task ChamaAColetaELeOResumo()
    {
        var handler = new StubHandler(HttpStatusCode.OK,
            """{"collected":[{"coinGeckoId":"bitcoin"},{"coinGeckoId":"ethereum"}],"notFoundCoinGeckoIds":["nao-existe"]}""");

        var summary = await Client(handler).TriggerAsync(CancellationToken.None);

        Assert.Equal(2, summary.CollectedCount);
        Assert.Equal(["nao-existe"], summary.NotFoundCoinGeckoIds);
        Assert.Equal(HttpMethod.Post, handler.LastRequest!.Method);
        Assert.Equal("http://marketdata/prices/collect", handler.LastRequest.RequestUri!.ToString());
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.ServiceUnavailable)]
    public async Task RespostaDeErro_ViraIndisponibilidade(HttpStatusCode status)
    {
        await Assert.ThrowsAsync<PriceCollectionUnavailableException>(() =>
            Client(new StubHandler(status, "{}")).TriggerAsync(CancellationToken.None));
    }

    private static MarketDataCollectionClient Client(StubHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("http://marketdata/") });

    private sealed class StubHandler(HttpStatusCode status, string body) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequest = request;
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") });
        }
    }
}
