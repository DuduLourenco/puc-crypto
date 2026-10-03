namespace PucCrypto.Forecast.Infrastructure.MarketData;

internal sealed class MarketDataOptions
{
    public const string SectionName = "MarketData";

    /// <summary>Endereço do microsserviço MarketData (ex.: http://localhost:5103/).</summary>
    public string BaseUrl { get; init; } = string.Empty;

    /// <summary>Chave exigida por POST /prices/collect no cabeçalho X-Api-Key.</summary>
    public string CollectorApiKey { get; init; } = string.Empty;
}
