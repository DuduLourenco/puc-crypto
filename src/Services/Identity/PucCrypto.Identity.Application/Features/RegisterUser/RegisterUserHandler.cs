using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Application.Features.RegisterUser;

internal sealed class RegisterUserHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    TimeProvider timeProvider) : ICommandHandler<RegisterUserCommand, RegisterUserResponse>
{
    private static readonly Error EmailAlreadyRegistered = Error.Conflict(
        "Identity.EmailAlreadyRegistered",
        "Já existe um usuário cadastrado com este e-mail.");

    public async Task<Result<RegisterUserResponse>> HandleAsync(
        RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var email = User.NormalizeEmail(command.Email);

        if (await userRepository.ExistsByEmailAsync(email, cancellationToken))
        {
            return EmailAlreadyRegistered;
        }

        var user = User.Create(
            command.Name,
            email,
            passwordHasher.Hash(command.Password),
            timeProvider.GetUtcNow().UtcDateTime);

        await userRepository.AddAsync(user, cancellationToken);

        return new RegisterUserResponse(user.Id, user.Name, user.Email);
    }
}
