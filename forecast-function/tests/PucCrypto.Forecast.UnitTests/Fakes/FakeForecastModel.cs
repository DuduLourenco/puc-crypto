using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.UnitTests.Fakes;

/// <summary>Repete o último preço da série, com uma faixa fixa de 10 dólares.</summary>
internal sealed class FakeForecastModel : IForecastModel
{
    public string Description => "modelo de teste";

    public IReadOnlyList<ForecastValue> Predict(PriceSeries series, int horizon) =>
        Enumerable.Range(1, horizon)
            .Select(_ => new ForecastValue(series.Last.PriceUsd, series.Last.PriceUsd - 10, series.Last.PriceUsd + 10))
            .ToList();
}
