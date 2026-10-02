using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.GetCrypto;

internal sealed class GetCryptoEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/cryptos/{id:guid}", async (
                Guid id,
                IQueryHandler<GetCryptoQuery, CryptoResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(new GetCryptoQuery(id), cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .RequireAuthorization()
            .WithName("GetCrypto")
            .WithTags("Cryptos")
            .WithSummary("Devolve uma criptomoeda do catálogo.")
            .Produces<CryptoResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
