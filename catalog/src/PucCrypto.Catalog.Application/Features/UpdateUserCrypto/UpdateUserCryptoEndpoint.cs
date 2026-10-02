using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.UpdateUserCrypto;

internal sealed class UpdateUserCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/user-cryptos/{id:guid}", async (
                Guid id,
                UpdateUserCryptoRequest request,
                ClaimsPrincipal user,
                ICommandHandler<UpdateUserCryptoCommand, UserCryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var command = new UpdateUserCryptoCommand(user.GetUserId(), id, request.Notes);

                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithValidation<UpdateUserCryptoRequest>()
            .RequireAuthorization()
            .WithName("UpdateUserCrypto")
            .WithTags("UserCryptos")
            .WithSummary("Altera as anotações de um item da lista do usuário autenticado.")
            .Produces<UserCryptoResponse>()
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
