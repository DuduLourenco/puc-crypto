namespace PucCrypto.Forecast.Domain.Forecasting;

/// <summary>
/// Série de preços usada na previsão: em ordem cronológica, sem instantes repetidos
/// e com um intervalo típico entre observações (a mediana dos intervalos).
/// </summary>
public sealed class PriceSeries
{
    public const int MinimumLength = 14;
    public const int MaximumLength = 1000;

    private PriceSeries(IReadOnlyList<PriceObservation> observations, TimeSpan step)
    {
        Observations = observations;
        Step = step;
    }

    public IReadOnlyList<PriceObservation> Observations { get; }

    /// <summary>Intervalo típico entre observações; define os instantes da previsão.</summary>
    public TimeSpan Step { get; }

    public PriceObservation Last => Observations[^1];

    public static PriceSeries Create(IEnumerable<PriceObservation> observations)
    {
        // Em instantes repetidos, prevalece a última observação recebida.
        var ordered = observations
            .Select(observation => observation with { Timestamp = ToUtc(observation.Timestamp) })
            .GroupBy(observation => observation.Timestamp)
            .Select(group => group.Last())
            .OrderBy(observation => observation.Timestamp)
            .ToList();

        if (ordered.Count is < MinimumLength or > MaximumLength)
        {
            throw new ArgumentException(
                $"A série precisa ter entre {MinimumLength} e {MaximumLength} instantes distintos; tem {ordered.Count}.",
                nameof(observations));
        }

        if (ordered.Any(observation => observation.PriceUsd <= 0))
        {
            throw new ArgumentException("Todos os preços precisam ser maiores que zero.", nameof(observations));
        }

        return new PriceSeries(ordered, MedianStep(ordered));
    }

    /// <summary>Instantes dos próximos <paramref name="horizon"/> passos depois da última observação.</summary>
    public IReadOnlyList<DateTime> NextTimestamps(int horizon) =>
        Enumerable.Range(1, horizon).Select(step => Last.Timestamp + Step * step).ToList();

    private static TimeSpan MedianStep(IReadOnlyList<PriceObservation> observations)
    {
        var intervals = observations
            .Zip(observations.Skip(1), (previous, next) => next.Timestamp - previous.Timestamp)
            .Order()
            .ToList();

        return intervals[intervals.Count / 2];
    }

    private static DateTime ToUtc(DateTime timestamp) => timestamp.Kind switch
    {
        DateTimeKind.Utc => timestamp,
        DateTimeKind.Local => timestamp.ToUniversalTime(),
        _ => DateTime.SpecifyKind(timestamp, DateTimeKind.Utc)
    };
}
