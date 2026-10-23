namespace PucCrypto.Forecast.Domain.Forecasting;

/// <summary>
/// Série de preços usada na previsão: em ordem cronológica, sem instantes repetidos
/// e com um intervalo típico entre observações: a mediana dos intervalos ponderada pela duração,
/// ou seja, o intervalo que cobre a maior parte do período.
/// </summary>
/// <remarks>
/// O modelo trata cada intervalo como um passo igual. Uma série com intervalos misturados (por
/// exemplo, 45 preços diários seguidos de 45 preços a cada 30 minutos, em que o intervalo típico é
/// o diário) é regularizada: fica a observação
/// mais recente de cada intervalo típico, contado a partir da última. Se a regularização deixar
/// menos de <see cref="MinimumLength"/> observações, a série é usada como chegou.
/// </remarks>
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

        var step = MedianStep(ordered);
        var regular = Regularize(ordered, step);

        return new PriceSeries(regular.Count >= MinimumLength ? regular : ordered, step);
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

        // Mediana ponderada: o intervalo em que a soma das durações chega à metade do período.
        var half = (observations[^1].Timestamp - observations[0].Timestamp) / 2;
        var covered = TimeSpan.Zero;

        foreach (var interval in intervals)
        {
            covered += interval;
            if (covered >= half)
            {
                return interval;
            }
        }

        return intervals[^1];
    }

    /// <summary>A observação mais recente de cada intervalo de duração <paramref name="step"/>, contado a partir da última.</summary>
    private static List<PriceObservation> Regularize(IReadOnlyList<PriceObservation> ordered, TimeSpan step)
    {
        var last = ordered[^1].Timestamp;

        return ordered
            .GroupBy(observation => (last - observation.Timestamp).Ticks / step.Ticks)
            .Select(group => group.MaxBy(observation => observation.Timestamp)!)
            .OrderBy(observation => observation.Timestamp)
            .ToList();
    }

    private static DateTime ToUtc(DateTime timestamp) => timestamp.Kind switch
    {
        DateTimeKind.Utc => timestamp,
        DateTimeKind.Local => timestamp.ToUniversalTime(),
        _ => DateTime.SpecifyKind(timestamp, DateTimeKind.Utc)
    };
}
