using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.ListUserCryptos;

internal sealed class ListUserCryptosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/user-cryptos", async (
                ClaimsPrincipal user,
                IQueryHandler<ListUserCryptosQuery, IReadOnlyList<UserCryptoResponse>> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new ListUserCryptosQuery(user.GetUserId()), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("ListUserCryptos")
            .WithTags("UserCryptos")
            .WithSummary("Lista as criptomoedas monitoradas pelo usuário autenticado.")
            .Produces<IReadOnlyList<UserCryptoResponse>>();
    }
}
