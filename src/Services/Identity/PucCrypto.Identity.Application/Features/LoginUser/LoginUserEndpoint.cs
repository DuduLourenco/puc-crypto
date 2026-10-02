using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.Identity.Application.Features.LoginUser;

internal sealed class LoginUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/login", async (
                LoginUserCommand command,
                ICommandHandler<LoginUserCommand, LoginUserResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : result.ToProblem();
            })
            .WithValidation<LoginUserCommand>();
    }
}
