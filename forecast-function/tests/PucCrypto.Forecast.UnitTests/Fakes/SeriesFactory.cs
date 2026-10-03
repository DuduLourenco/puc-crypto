using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.UnitTests.Fakes;

internal static class SeriesFactory
{
    public static readonly DateTime Start = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    /// <summary>Uma observação por dia, com o preço calculado pela função a partir do índice do dia.</summary>
    public static List<PriceObservation> Daily(int days, Func<int, decimal> price) =>
        Enumerable.Range(0, days).Select(day => new PriceObservation(Start.AddDays(day), price(day))).ToList();
}
