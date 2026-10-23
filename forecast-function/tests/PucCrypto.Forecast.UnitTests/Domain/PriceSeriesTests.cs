using PucCrypto.Forecast.Domain.Forecasting;
using PucCrypto.Forecast.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Forecast.UnitTests.Domain;

public sealed class PriceSeriesTests
{
    [Fact]
    public void Create_OrdenaEDescartaInstantesRepetidos_MantendoAUltimaObservacao()
    {
        var observations = SeriesFactory.Daily(20, day => 100 + day);
        observations.Reverse();
        observations.Add(new PriceObservation(SeriesFactory.Start, 999));

        var series = PriceSeries.Create(observations);

        Assert.Equal(20, series.Observations.Count);
        Assert.Equal(999, series.Observations[0].PriceUsd);
        Assert.Equal(119, series.Last.PriceUsd);
        Assert.True(series.Observations.Zip(series.Observations.Skip(1)).All(pair => pair.First.Timestamp < pair.Second.Timestamp));
    }

    [Fact]
    public void Step_EAMedianaDosIntervalos_EDefineOsProximosInstantes()
    {
        var observations = SeriesFactory.Daily(20, _ => 100);
        observations.Add(new PriceObservation(SeriesFactory.Start.AddDays(19).AddHours(3), 100));

        var series = PriceSeries.Create(observations);

        Assert.Equal(TimeSpan.FromDays(1), series.Step);
        Assert.Equal(
            [series.Last.Timestamp.AddDays(1), series.Last.Timestamp.AddDays(2)],
            series.NextTimestamps(2));
    }

    [Fact]
    public void Create_RegularizaSerieComIntervalosMisturados_MantendoOMaisRecenteDeCadaIntervalo()
    {
        // 30 preços diários seguidos de 20 preços a cada 30 minutos no último dia.
        var observations = SeriesFactory.Daily(30, day => 100 + day);
        observations.AddRange(Enumerable.Range(1, 20)
            .Select(step => new PriceObservation(SeriesFactory.Start.AddDays(29).AddMinutes(30 * step), 200 + step)));

        var series = PriceSeries.Create(observations);

        Assert.Equal(TimeSpan.FromDays(1), series.Step);
        Assert.Equal(30, series.Observations.Count);
        Assert.Equal(220, series.Last.PriceUsd);
        Assert.Equal(128, series.Observations[^2].PriceUsd);
    }

    [Fact]
    public void Step_ComMaisPontosCurtosQueDiarios_ContinuaDiario()
    {
        // 45 intervalos de 30 minutos e 44 de um dia: a mediana simples seria 30 minutos.
        var observations = SeriesFactory.Daily(45, day => 100 + day);
        observations.AddRange(Enumerable.Range(1, 45)
            .Select(step => new PriceObservation(SeriesFactory.Start.AddDays(44).AddMinutes(30 * step), 200 + step)));

        var series = PriceSeries.Create(observations);

        Assert.Equal(TimeSpan.FromDays(1), series.Step);
        Assert.Equal(45, series.Observations.Count);
    }

    [Fact]
    public void Create_SemPontosSuficientesDepoisDeRegularizar_UsaASerieComoChegou()
    {
        // 8 preços diários e 8 a cada 30 minutos: a regularização deixaria 8 pontos, menos que o mínimo.
        var observations = SeriesFactory.Daily(8, day => 100 + day);
        observations.AddRange(Enumerable.Range(1, 8)
            .Select(step => new PriceObservation(SeriesFactory.Start.AddDays(7).AddMinutes(30 * step), 200 + step)));

        var series = PriceSeries.Create(observations);

        Assert.Equal(16, series.Observations.Count);
    }

    [Fact]
    public void Create_RecusaSerieCurtaOuComPrecoNaoPositivo()
    {
        Assert.Throws<ArgumentException>(() => PriceSeries.Create(SeriesFactory.Daily(PriceSeries.MinimumLength - 1, _ => 1)));
        Assert.Throws<ArgumentException>(() => PriceSeries.Create(SeriesFactory.Daily(20, day => day == 5 ? 0 : 1)));
    }
}
