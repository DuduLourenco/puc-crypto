namespace PucCrypto.Forecast.Application.Features.GetForecast;

/// <summary>
/// Corpo da requisição: a série de preços (no mesmo formato devolvido pelo MarketData)
/// e quantos passos prever. Sem horizonte, prevê <see cref="DefaultHorizon"/> passos.
/// </summary>
public sealed record GetForecastQuery(IReadOnlyList<PriceInput>? Prices, int? Horizon)
{
    public const int DefaultHorizon = 7;
    public const int MaxHorizon = 30;
}

public sealed record PriceInput(DateTime Timestamp, decimal PriceUsd);
