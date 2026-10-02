using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.GetUserCrypto;

internal sealed class GetUserCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/cryptos/{id:guid}", async (
                Guid id,
                ClaimsPrincipal user,
                IQueryHandler<GetUserCryptoQuery, UserCryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new GetUserCryptoQuery(user.GetUserId(), id), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization();
    }
}
