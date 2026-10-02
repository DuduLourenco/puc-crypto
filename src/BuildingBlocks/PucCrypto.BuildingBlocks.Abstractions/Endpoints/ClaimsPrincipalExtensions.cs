using System.Security.Claims;

namespace PucCrypto.BuildingBlocks.Abstractions.Endpoints;

public static class ClaimsPrincipalExtensions
{
    /// <summary>Id do usuário autenticado, lido da claim "sub" do JWT emitido pelo Identity.</summary>
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue("sub"), out var userId)
            ? userId
            : throw new InvalidOperationException("O token não possui a claim 'sub' com o id do usuário.");
}
