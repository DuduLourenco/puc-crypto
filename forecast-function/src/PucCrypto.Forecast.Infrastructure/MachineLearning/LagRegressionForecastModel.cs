using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Trainers;
using PucCrypto.Forecast.Application.Abstractions;
using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.Infrastructure.MachineLearning;

/// <summary>
/// Previsão com ML.NET: uma regressão linear (SDCA) aprende a próxima variação percentual do
/// preço a partir das <see cref="Lags"/> variações anteriores. Trabalhar com variações deixa o
/// modelo na mesma escala para qualquer moeda e preserva a tendência da série. A previsão é feita
/// passo a passo, usando cada variação prevista como entrada da seguinte. O intervalo de 95% vem
/// do erro do modelo na própria série e cresce com a raiz do número de passos.
/// </summary>
/// <remarks>
/// O forecasting por SSA do ML.NET depende da Intel MKL, que não existe para ARM64 (ADR-039).
/// O SDCA é totalmente gerenciado e roda em qualquer arquitetura.
/// </remarks>
internal sealed class LagRegressionForecastModel : IForecastModel
{
    public const int Lags = 7;

    private const float ConfidenceZ = 1.96f;

    public string Description => $"ML.NET SDCA: regressão linear sobre as variações dos {Lags} preços anteriores";

    public IReadOnlyList<ForecastValue> Predict(PriceSeries series, int horizon)
    {
        var prices = series.Observations.Select(observation => (double)observation.PriceUsd).ToArray();

        // Variação percentual de cada preço em relação ao anterior.
        var returns = Enumerable.Range(1, prices.Length - 1)
            .Select(index => (float)((prices[index] / prices[index - 1] - 1) * 100))
            .ToList();

        var trainingRows = Enumerable.Range(Lags, returns.Count - Lags)
            .Select(index => new LagRow { Features = PreviousValues(returns, index), Label = returns[index] })
            .ToList();

        // As entradas são padronizadas (média 0, variância 1) antes do SDCA. Semente fixa, uma thread
        // e sem embaralhar: a mesma série produz sempre a mesma previsão.
        var mlContext = new MLContext(seed: 0);
        var pipeline = mlContext.Transforms.NormalizeMeanVariance(nameof(LagRow.Features))
            .Append(mlContext.Regression.Trainers.Sdca(new SdcaRegressionTrainer.Options
            {
                NumberOfThreads = 1,
                Shuffle = false,
                MaximumNumberOfIterations = 200
            }));
        var model = pipeline.Fit(mlContext.Data.LoadFromEnumerable(trainingRows));
        var engine = mlContext.Model.CreatePredictionEngine<LagRow, LagPrediction>(model);

        var residualStdDev = StandardDeviation(trainingRows.Select(row => row.Label - engine.Predict(row).Score));

        var window = returns.ToList();
        var price = prices[^1];
        var forecast = new List<ForecastValue>(horizon);

        for (var step = 1; step <= horizon; step++)
        {
            var nextReturn = engine.Predict(new LagRow { Features = PreviousValues(window, window.Count) }).Score;
            var margin = ConfidenceZ * residualStdDev * Math.Sqrt(step) / 100;

            window.Add(nextReturn);
            price = Math.Max(price * (1 + nextReturn / 100.0), 0);

            forecast.Add(new ForecastValue(
                ToUsd(price),
                ToUsd(Math.Max(price * (1 - margin), 0)),
                ToUsd(price * (1 + margin))));
        }

        return forecast;
    }

    /// <summary>Os <see cref="Lags"/> valores anteriores à posição, do mais recente ao mais antigo.</summary>
    private static float[] PreviousValues(IReadOnlyList<float> values, int index) =>
        Enumerable.Range(1, Lags).Select(lag => values[index - lag]).ToArray();

    private static double StandardDeviation(IEnumerable<float> values)
    {
        var list = values.Select(value => (double)value).ToList();
        var mean = list.Average();

        return Math.Sqrt(list.Sum(value => (value - mean) * (value - mean)) / list.Count);
    }

    private static decimal ToUsd(double value) => Math.Round((decimal)value, 2);

    private sealed class LagRow
    {
        [VectorType(Lags)]
        public float[] Features { get; set; } = [];

        public float Label { get; set; }
    }

    private sealed class LagPrediction
    {
        public float Score { get; set; }
    }
}
