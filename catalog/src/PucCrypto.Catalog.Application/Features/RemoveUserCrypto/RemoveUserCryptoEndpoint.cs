using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.Catalog.Application.Features.RemoveUserCrypto;

internal sealed class RemoveUserCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/cryptos/{id:guid}", async (
                Guid id,
                ClaimsPrincipal user,
                ICommandHandler<RemoveUserCryptoCommand> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new RemoveUserCryptoCommand(user.GetUserId(), id), cancellationToken);

                return result.IsSuccess
                    ? Results.NoContent()
                    : result.ToProblem();
            })
            .RequireAuthorization();
    }
}
