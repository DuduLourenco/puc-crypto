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
        app.MapPost("/cryptos", async (
                AddUserCryptoRequest request,
                ClaimsPrincipal user,
                ICommandHandler<AddUserCryptoCommand, UserCryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var command = new AddUserCryptoCommand(
                    user.GetUserId(),
                    request.CoinGeckoId,
                    request.Symbol,
                    request.Name,
                    request.Notes);

                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Created($"/cryptos/{result.Value.Id}", result.Value)
                    : result.ToProblem();
            })
            .WithValidation<AddUserCryptoRequest>()
            .RequireAuthorization();
    }
}
