using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.ListPricePoints;

internal sealed class ListPricePointsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/prices", async (
                [AsParameters] ListPricePointsQuery query,
                IQueryHandler<ListPricePointsQuery, IReadOnlyList<PricePointResponse>> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(query, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithValidation<ListPricePointsQuery>()
            .RequireAuthorization()
            .WithName("ListPricePoints")
            .WithTags("Prices")
            .WithSummary("Lista o histórico de preços de uma criptomoeda, do mais antigo ao mais recente.")
            .Produces<IReadOnlyList<PricePointResponse>>()
            .ProducesValidationProblem();
    }
}
