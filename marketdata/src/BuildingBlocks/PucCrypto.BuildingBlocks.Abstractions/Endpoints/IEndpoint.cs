using Microsoft.AspNetCore.Routing;

namespace PucCrypto.BuildingBlocks.Abstractions.Endpoints;

/// <summary>Ponto de entrada HTTP de uma slice.</summary>
public interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
