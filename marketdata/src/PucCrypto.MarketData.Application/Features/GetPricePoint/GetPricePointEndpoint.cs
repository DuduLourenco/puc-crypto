using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.GetPricePoint;

internal sealed class GetPricePointEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/prices/{id:guid}", async (
                Guid id,
                IQueryHandler<GetPricePointQuery, PricePointResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new GetPricePointQuery(id), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("GetPricePoint")
            .WithTags("Prices")
            .WithSummary("Devolve um preço.")
            .Produces<PricePointResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
