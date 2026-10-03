using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.Application.Features.GetForecast;

/// <summary>Monta a série, pede ao modelo os próximos valores e associa cada um ao seu instante.</summary>
internal sealed class GetForecastHandler(IForecastModel forecastModel)
    : IQueryHandler<GetForecastQuery, GetForecastResponse>
{
    public Task<Result<GetForecastResponse>> HandleAsync(GetForecastQuery query, CancellationToken cancellationToken)
    {
        var series = PriceSeries.Create(query.Prices!.Select(price => new PriceObservation(price.Timestamp, price.PriceUsd)));
        var horizon = query.Horizon ?? GetForecastQuery.DefaultHorizon;

        var values = forecastModel.Predict(series, horizon);

        var forecast = series.NextTimestamps(horizon)
            .Zip(values, (timestamp, value) => new ForecastPoint(timestamp, value.PriceUsd, value.LowerUsd, value.UpperUsd))
            .ToList();

        Result<GetForecastResponse> result = new GetForecastResponse(
            forecastModel.Description,
            series.Observations.Count,
            horizon,
            series.Step.TotalSeconds,
            series.Last,
            forecast);

        return Task.FromResult(result);
    }
}
