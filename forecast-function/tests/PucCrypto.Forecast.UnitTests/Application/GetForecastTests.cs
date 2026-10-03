using PucCrypto.Forecast.Application.Features.GetForecast;
using PucCrypto.Forecast.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Forecast.UnitTests.Application;

public sealed class GetForecastTests
{
    private static List<PriceInput> Prices(int days) =>
        SeriesFactory.Daily(days, day => 100 + day).Select(price => new PriceInput(price.Timestamp, price.PriceUsd)).ToList();

    [Fact]
    public async Task Handler_AssociaCadaValorPrevistoAoProximoInstanteDaSerie()
    {
        var handler = new GetForecastHandler(new FakeForecastModel());

        var result = await handler.HandleAsync(new GetForecastQuery(Prices(30), 3), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var response = result.Value;
        Assert.Equal("modelo de teste", response.Model);
        Assert.Equal(30, response.TrainingPoints);
        Assert.Equal(TimeSpan.FromDays(1).TotalSeconds, response.IntervalSeconds);
        Assert.Equal(129, response.LastObservation.PriceUsd);
        Assert.Equal(3, response.Forecast.Count);
        Assert.Equal(SeriesFactory.Start.AddDays(32), response.Forecast[^1].Timestamp);
        Assert.All(response.Forecast, point => Assert.Equal(129, point.PriceUsd));
    }

    [Fact]
    public async Task Handler_SemHorizonte_UsaOPadrao()
    {
        var result = await new GetForecastHandler(new FakeForecastModel())
            .HandleAsync(new GetForecastQuery(Prices(30), null), CancellationToken.None);

        Assert.Equal(GetForecastQuery.DefaultHorizon, result.Value.Forecast.Count);
    }

    [Fact]
    public void Validator_AceitaSerieValida()
    {
        Assert.True(new GetForecastValidator().Validate(new GetForecastQuery(Prices(30), 7)).IsValid);
    }

    [Theory]
    [InlineData(10, 7)]
    [InlineData(30, 0)]
    [InlineData(30, 31)]
    public void Validator_RecusaSerieCurtaEHorizonteForaDoLimite(int days, int horizon)
    {
        Assert.False(new GetForecastValidator().Validate(new GetForecastQuery(Prices(days), horizon)).IsValid);
    }

    [Fact]
    public void Validator_RecusaSerieAusenteEPrecoNaoPositivo()
    {
        var prices = Prices(30);
        prices[3] = prices[3] with { PriceUsd = -1 };

        Assert.False(new GetForecastValidator().Validate(new GetForecastQuery(null, 7)).IsValid);
        Assert.False(new GetForecastValidator().Validate(new GetForecastQuery(prices, 7)).IsValid);
    }
}
