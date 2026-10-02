namespace PucCrypto.MarketData.Infrastructure.CoinGecko;

internal sealed class CoinGeckoOptions
{
    public const string SectionName = "CoinGecko";

    public string BaseUrl { get; init; } = "https://api.coingecko.com/api/v3/";

    /// <summary>Chave do plano Demo da CoinGecko (opcional); sem ela, o limite de requisições é menor.</summary>
    public string? ApiKey { get; init; }
}
