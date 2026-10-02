using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.UpdateCrypto;

internal sealed class UpdateCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/cryptos/{id:guid}", async (
                Guid id,
                UpdateCryptoRequest request,
                ICommandHandler<UpdateCryptoCommand, CryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var command = new UpdateCryptoCommand(id, request.Symbol, request.Name);

                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithValidation<UpdateCryptoRequest>()
            .RequireAuthorization()
            .WithName("UpdateCrypto")
            .WithTags("Cryptos")
            .WithSummary("Altera o símbolo e o nome de uma criptomoeda do catálogo.")
            .Produces<CryptoResponse>()
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
