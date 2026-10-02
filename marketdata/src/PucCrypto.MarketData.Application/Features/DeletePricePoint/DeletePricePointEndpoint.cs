using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.MarketData.Application.Features.DeletePricePoint;

internal sealed class DeletePricePointEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/prices/{id:guid}", async (
                Guid id,
                ICommandHandler<DeletePricePointCommand> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new DeletePricePointCommand(id), cancellationToken);

                return result.IsSuccess
                    ? Results.NoContent()
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("DeletePricePoint")
            .WithTags("Prices")
            .WithSummary("Exclui um preço.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
