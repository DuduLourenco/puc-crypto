using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.UpdatePricePoint;

internal sealed class UpdatePricePointEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/prices/{id:guid}", async (
                Guid id,
                UpdatePricePointRequest request,
                ICommandHandler<UpdatePricePointCommand, PricePointResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new UpdatePricePointCommand(id, request.PriceUsd), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithValidation<UpdatePricePointRequest>()
            .RequireAuthorization()
            .WithName("UpdatePricePoint")
            .WithTags("Prices")
            .WithSummary("Altera o valor de um preço.")
            .Produces<PricePointResponse>()
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
