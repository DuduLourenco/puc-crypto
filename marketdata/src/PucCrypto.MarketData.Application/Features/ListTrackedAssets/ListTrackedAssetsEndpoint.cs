using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.MarketData.Application.Features.ListTrackedAssets;

internal sealed class ListTrackedAssetsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/assets", async (
                IQueryHandler<ListTrackedAssetsQuery, IReadOnlyList<TrackedAssetResponse>> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new ListTrackedAssetsQuery(), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("ListTrackedAssets")
            .WithTags("Assets")
            .WithSummary("Lista as criptomoedas acompanhadas, recebidas do Catalog por eventos.")
            .Produces<IReadOnlyList<TrackedAssetResponse>>();
    }
}
