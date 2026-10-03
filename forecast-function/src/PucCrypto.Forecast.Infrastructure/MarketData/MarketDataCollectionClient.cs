using System.Net.Http.Json;
using System.Text.Json;
using PucCrypto.Forecast.Application.Abstractions;

namespace PucCrypto.Forecast.Infrastructure.MarketData;

/// <summary>Chama POST /prices/collect do MarketData, com a chave de coleta no cabeçalho X-Api-Key.</summary>
internal sealed class MarketDataCollectionClient(HttpClient httpClient) : IPriceCollectionTrigger
{
    public async Task<PriceCollectionSummary> TriggerAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClient.PostAsync("prices/collect", content: null, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new PriceCollectionUnavailableException($"MarketData respondeu {(int)response.StatusCode} à coleta.");
            }

            var body = await response.Content.ReadFromJsonAsync<CollectResponse>(cancellationToken)
                ?? throw new PriceCollectionUnavailableException("MarketData devolveu uma resposta vazia à coleta.");

            return new PriceCollectionSummary(body.Collected.Count, body.NotFoundCoinGeckoIds);
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException or JsonException
                                          && !cancellationToken.IsCancellationRequested)
        {
            throw new PriceCollectionUnavailableException("Falha ao chamar a coleta do MarketData.", exception);
        }
    }

    private sealed record CollectResponse(IReadOnlyList<JsonElement> Collected, IReadOnlyList<string> NotFoundCoinGeckoIds);
}
