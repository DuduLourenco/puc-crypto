using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.Application.Abstractions;

/// <summary>Porta do modelo de machine learning que projeta a série de preços.</summary>
public interface IForecastModel
{
    /// <summary>Descrição do modelo, devolvida junto com a previsão.</summary>
    string Description { get; }

    /// <summary>Valores previstos para os próximos <paramref name="horizon"/> passos da série, em ordem.</summary>
    IReadOnlyList<ForecastValue> Predict(PriceSeries series, int horizon);
}

public sealed record ForecastValue(decimal PriceUsd, decimal LowerUsd, decimal UpperUsd);
