using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.Application.Features.GetForecast;

public sealed record GetForecastResponse(
    string Model,
    int TrainingPoints,
    int Horizon,
    double IntervalSeconds,
    PriceObservation LastObservation,
    IReadOnlyList<ForecastPoint> Forecast);
