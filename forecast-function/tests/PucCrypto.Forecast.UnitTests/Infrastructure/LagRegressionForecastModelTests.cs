using PucCrypto.Forecast.Domain.Forecasting;
using PucCrypto.Forecast.Infrastructure.MachineLearning;
using PucCrypto.Forecast.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Forecast.UnitTests.Infrastructure;

/// <summary>Treina o modelo de verdade (ML.NET) com séries sintéticas de comportamento conhecido.</summary>
public sealed class LagRegressionForecastModelTests
{
    private readonly LagRegressionForecastModel _model = new();

    [Fact]
    public void SerieConstante_PreveOMesmoPreco()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(60, _ => 50000m));

        var forecast = _model.Predict(series, 7);

        Assert.Equal(7, forecast.Count);
        Assert.All(forecast, value => Assert.InRange(value.PriceUsd, 49900m, 50100m));
    }

    [Fact]
    public void TendenciaDeAlta_ContinuaSubindo()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(90, day => 60000m + day * 100m));

        var forecast = _model.Predict(series, 7);

        Assert.True(forecast[0].PriceUsd > series.Last.PriceUsd);
        Assert.True(forecast.Zip(forecast.Skip(1)).All(pair => pair.Second.PriceUsd > pair.First.PriceUsd));
        // Último preço 68.900, subindo 100 por dia: em 7 dias, perto de 69.600.
        Assert.InRange(forecast[^1].PriceUsd, 69400m, 69900m);
    }

    [Fact]
    public void TendenciaDeQueda_ContinuaCaindo()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(60, day => 3000m - day * 20m));

        var forecast = _model.Predict(series, 5);

        Assert.True(forecast[0].PriceUsd < series.Last.PriceUsd);
        Assert.True(forecast.Zip(forecast.Skip(1)).All(pair => pair.Second.PriceUsd < pair.First.PriceUsd));
    }

    [Fact]
    public void IntervaloDeConfianca_ContemAPrevisao_ECresceComOHorizonte()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(90, day => 60000m + 1500m * (decimal)Math.Sin(day / 5.0)));

        var forecast = _model.Predict(series, 10);

        Assert.All(forecast, value => Assert.True(value.LowerUsd <= value.PriceUsd && value.PriceUsd <= value.UpperUsd));
        Assert.True(forecast[^1].UpperUsd - forecast[^1].LowerUsd > forecast[0].UpperUsd - forecast[0].LowerUsd);
    }

    [Fact]
    public void MesmaSerie_ProduzAMesmaPrevisao()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(90, day => 3000m + 40m * (decimal)Math.Cos(day / 3.0)));

        Assert.Equal(_model.Predict(series, 7), _model.Predict(series, 7));
    }
}
