using System.Net;
using System.Text.Json;
using PucCrypto.MarketData.Application.Abstractions;

namespace PucCrypto.MarketData.Infrastructure.CoinGecko;

/// <summary>Adaptador da API pública da CoinGecko para a porta <see cref="IMarketPriceProvider"/>.</summary>
internal sealed class CoinGeckoClient(HttpClient httpClient) : IMarketPriceProvider
{
    public async Task<IReadOnlyDictionary<string, MarketPrice>> GetCurrentPricesAsync(
        IReadOnlyCollection<string> coinGeckoIds,
        CancellationToken cancellationToken)
    {
        var ids = Uri.EscapeDataString(string.Join(',', coinGeckoIds));

        // Resposta: { "bitcoin": { "usd": 65000.12, "last_updated_at": 1700000000 }, ... }
        using var document = await GetJsonAsync(
            $"simple/price?ids={ids}&vs_currencies=usd&include_last_updated_at=true",
            cancellationToken);

        var prices = new Dictionary<string, MarketPrice>();

        foreach (var coin in document?.RootElement.EnumerateObject() ?? Enumerable.Empty<JsonProperty>())
        {
            if (coin.Value.TryGetProperty("usd", out var usd) && coin.Value.TryGetProperty("last_updated_at", out var updatedAt))
            {
                prices[coin.Name] = new MarketPrice(
                    DateTimeOffset.FromUnixTimeSeconds(updatedAt.GetInt64()).UtcDateTime,
                    usd.GetDecimal());
            }
        }

        return prices;
    }

    public async Task<IReadOnlyList<MarketPrice>> GetDailyHistoryAsync(
        string coinGeckoId,
        int days,
        CancellationToken cancellationToken)
    {
        // Resposta: { "prices": [[1700000000000, 65000.12], ...] }, com o instante em milissegundos.
        using var document = await GetJsonAsync(
            $"coins/{Uri.EscapeDataString(coinGeckoId)}/market_chart?vs_currency=usd&days={days}&interval=daily",
            cancellationToken);

        if (document is null || !document.RootElement.TryGetProperty("prices", out var prices))
        {
            return [];
        }

        return prices.EnumerateArray()
            .Select(point => new MarketPrice(
                DateTimeOffset.FromUnixTimeMilliseconds((long)point[0].GetDouble()).UtcDateTime,
                point[1].GetDecimal()))
            .Where(price => price.PriceUsd > 0)
            .ToList();
    }

    /// <summary>Devolve nulo quando a moeda não existe (404); converte as demais falhas em indisponibilidade.</summary>
    private async Task<JsonDocument?> GetJsonAsync(string path, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClient.GetAsync(path, cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new MarketPriceUnavailableException($"CoinGecko respondeu {(int)response.StatusCode} para {path}.");
            }

            await using var body = await response.Content.ReadAsStreamAsync(cancellationToken);

            return await JsonDocument.ParseAsync(body, cancellationToken: cancellationToken);
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException or JsonException
                                          && !cancellationToken.IsCancellationRequested)
        {
            throw new MarketPriceUnavailableException($"Falha ao consultar a CoinGecko ({path}).", exception);
        }
    }
}
