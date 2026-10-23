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
    public void SerieComIntervalosMisturados_NaoLevaOPrecoAZero()
    {
        // Como o histórico da nuvem antes da correção da coleta: 45 preços diários, com variações de
        // alguns por cento, seguidos de 45 preços a cada 30 minutos, com variações bem menores.
        var random = new Random(42);
        var observations = new List<PriceObservation>();
        var price = 100.0;
        for (var day = 0; day < 45; day++)
        {
            price *= 1 + (random.NextDouble() - 0.5) * 0.08;
            observations.Add(new PriceObservation(SeriesFactory.Start.AddDays(day), (decimal)price));
        }
        for (var step = 1; step <= 45; step++)
        {
            price *= 1 + (random.NextDouble() - 0.5) * 0.004;
            observations.Add(new PriceObservation(SeriesFactory.Start.AddDays(44).AddMinutes(30 * step), (decimal)price));
        }
        var series = PriceSeries.Create(observations);
        var prices = observations.Select(observation => observation.PriceUsd).ToList();
        var largestChange = prices.Zip(prices.Skip(1), (previous, next) => Math.Abs(next / previous - 1)).Max();

        var forecast = _model.Predict(series, 30);

        Assert.All(forecast, value => Assert.True(value.PriceUsd > 0));
        var steps = new[] { series.Last.PriceUsd }.Concat(forecast.Select(value => value.PriceUsd)).ToList();
        Assert.All(steps.Zip(steps.Skip(1)), pair =>
            Assert.True(Math.Abs(pair.Second / pair.First - 1) <= largestChange + 0.0001m));
    }

    [Fact]
    public void SerieCurta_NaoProjetaVariacoesExtremas()
    {
        // 14 preços diários, o mínimo aceito, com variações de até 3% ao dia e sem tendência definida.
        var random = new Random(7);
        var price = 100m;
        var observations = SeriesFactory.Daily(14, _ => price *= 1 + (decimal)((random.NextDouble() - 0.5) * 0.06));
        var series = PriceSeries.Create(observations);

        var forecast = _model.Predict(series, 30);

        Assert.InRange(forecast[^1].PriceUsd, series.Last.PriceUsd * 0.75m, series.Last.PriceUsd * 1.25m);
        Assert.True(forecast[^1].UpperUsd - forecast[^1].LowerUsd > series.Last.PriceUsd * 0.05m);
    }

    [Fact]
    public void MesmaSerie_ProduzAMesmaPrevisao()
    {
        var series = PriceSeries.Create(SeriesFactory.Daily(90, day => 3000m + 40m * (decimal)Math.Cos(day / 3.0)));

        Assert.Equal(_model.Predict(series, 7), _model.Predict(series, 7));
    }
}
