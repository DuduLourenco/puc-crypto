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
    public void Create_RecusaSerieCurtaOuComPrecoNaoPositivo()
    {
        Assert.Throws<ArgumentException>(() => PriceSeries.Create(SeriesFactory.Daily(PriceSeries.MinimumLength - 1, _ => 1)));
        Assert.Throws<ArgumentException>(() => PriceSeries.Create(SeriesFactory.Daily(20, day => day == 5 ? 0 : 1)));
    }
}
