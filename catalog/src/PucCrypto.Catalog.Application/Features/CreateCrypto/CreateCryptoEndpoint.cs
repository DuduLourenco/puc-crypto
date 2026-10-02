using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.CreateCrypto;

internal sealed class CreateCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/cryptos", async (
                CreateCryptoCommand command,
                ICommandHandler<CreateCryptoCommand, CryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Created($"/cryptos/{result.Value.Id}", result.Value)
                    : result.ToProblem();
            })
            .WithValidation<CreateCryptoCommand>()
            .RequireAuthorization()
            .WithName("CreateCrypto")
            .WithTags("Cryptos")
            .WithSummary("Cadastra uma criptomoeda no catálogo e publica o evento CryptoRegistered.")
            .Produces<CryptoResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);
    }
}
