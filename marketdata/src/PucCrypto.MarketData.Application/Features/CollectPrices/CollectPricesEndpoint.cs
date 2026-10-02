using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.MarketData.Application.Features.CollectPrices;

/// <summary>
/// Chamado pela Azure Function agendada, que não tem usuário: em vez do JWT,
/// exige a chave configurada em Collector:ApiKey no cabeçalho X-Api-Key.
/// </summary>
internal sealed class CollectPricesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/prices/collect", async (
                [FromHeader(Name = "X-Api-Key")] string? apiKey,
                IConfiguration configuration,
                ICommandHandler<CollectPricesCommand, CollectPricesResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var expectedKey = configuration["Collector:ApiKey"];

                if (string.IsNullOrEmpty(expectedKey) || apiKey != expectedKey)
                {
                    return Results.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "MarketData.InvalidCollectorKey");
                }

                var result = await handler.HandleAsync(new CollectPricesCommand(), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithName("CollectPrices")
            .WithTags("Collection")
            .WithSummary("Coleta na CoinGecko o preço atual dos ativos acompanhados e publica PricesIngested.")
            .Produces<CollectPricesResponse>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }
}
