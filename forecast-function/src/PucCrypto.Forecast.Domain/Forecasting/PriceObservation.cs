namespace PucCrypto.Forecast.Domain.Forecasting;

/// <summary>Preço em dólar observado em um instante (UTC).</summary>
public sealed record PriceObservation(DateTime Timestamp, decimal PriceUsd);
