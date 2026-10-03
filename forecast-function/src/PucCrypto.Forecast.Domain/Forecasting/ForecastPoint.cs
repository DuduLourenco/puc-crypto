namespace PucCrypto.Forecast.Domain.Forecasting;

/// <summary>Preço previsto para um instante, com o intervalo de confiança de 95%.</summary>
public sealed record ForecastPoint(DateTime Timestamp, decimal PriceUsd, decimal LowerUsd, decimal UpperUsd);
