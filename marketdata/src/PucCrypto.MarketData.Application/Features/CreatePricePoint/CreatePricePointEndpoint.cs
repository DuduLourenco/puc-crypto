using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.CreatePricePoint;

internal sealed class CreatePricePointEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/prices", async (
                CreatePricePointCommand command,
                ICommandHandler<CreatePricePointCommand, PricePointResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Created($"/prices/{result.Value.Id}", result.Value)
                    : result.ToProblem();
            })
            .WithValidation<CreatePricePointCommand>()
            .RequireAuthorization()
            .WithName("CreatePricePoint")
            .WithTags("Prices")
            .WithSummary("Cadastra manualmente um preço de uma criptomoeda acompanhada.")
            .Produces<PricePointResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }
}
