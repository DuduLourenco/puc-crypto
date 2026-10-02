using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;

namespace PucCrypto.Identity.Application.Features.RegisterUser;

internal sealed class RegisterUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/register", async (
                RegisterUserCommand command,
                ICommandHandler<RegisterUserCommand, RegisterUserResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var result = await handler.HandleAsync(command, cancellationToken);

                return result.IsSuccess
                    ? Results.Created((string?)null, result.Value)
                    : result.ToProblem();
            })
            .WithValidation<RegisterUserCommand>()
            .WithName("RegisterUser")
            .WithTags("Auth")
            .WithSummary("Cadastra um usuário.")
            .Produces<RegisterUserResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);
    }
}
