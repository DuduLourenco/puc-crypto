using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.ListCryptos;

internal sealed class ListCryptosEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/cryptos", async (
                IQueryHandler<ListCryptosQuery, IReadOnlyList<CryptoResponse>> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new ListCryptosQuery(), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("ListCryptos")
            .WithTags("Cryptos")
            .WithSummary("Lista as criptomoedas do catálogo, por nome.")
            .Produces<IReadOnlyList<CryptoResponse>>();
    }
}
