using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Application.Features.LoginUser;

internal sealed class LoginUserHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : ICommandHandler<LoginUserCommand, LoginUserResponse>
{
    // A mesma falha para e-mail inexistente e senha errada, para não revelar quais e-mails estão cadastrados.
    private static readonly Error InvalidCredentials = Error.Unauthorized(
        "Identity.InvalidCredentials",
        "E-mail ou senha inválidos.");

    public async Task<Result<LoginUserResponse>> HandleAsync(
        LoginUserCommand command,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(User.NormalizeEmail(command.Email), cancellationToken);

        if (user is null || !passwordHasher.Verify(command.Password, user.PasswordHash))
        {
            return InvalidCredentials;
        }

        var accessToken = jwtTokenGenerator.Generate(user);

        return new LoginUserResponse(accessToken.Value, accessToken.ExpiresAt);
    }
}
