using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

internal sealed class AddUserCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/user-cryptos", async (
                AddUserCryptoRequest request,
                ClaimsPrincipal user,
                ICommandHandler<AddUserCryptoCommand, UserCryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var command = new AddUserCryptoCommand(user.GetUserId(), request.CryptocurrencyId, request.Notes);

                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Created($"/user-cryptos/{result.Value.Id}", result.Value)
                    : result.ToProblem();
            })
            .WithValidation<AddUserCryptoRequest>()
            .RequireAuthorization()
            .WithName("AddUserCrypto")
            .WithTags("UserCryptos")
            .WithSummary("Adiciona uma criptomoeda do catálogo à lista do usuário autenticado.")
            .Produces<UserCryptoResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }
}
