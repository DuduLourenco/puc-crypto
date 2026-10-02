using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Identity.Application.Features.RegisterUser;
using PucCrypto.Identity.Domain.Users;
using PucCrypto.Identity.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Application;

public sealed class RegisterUserHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);

    private readonly InMemoryUserRepository _users = new();
    private readonly RegisterUserHandler _handler;

    public RegisterUserHandlerTests()
    {
        _handler = new RegisterUserHandler(_users, new FakePasswordHasher(), new FixedTimeProvider(Now));
    }

    [Fact]
    public async Task HandleAsync_GravaOUsuarioComSenhaEmHash()
    {
        var command = new RegisterUserCommand("Ana Souza", "Ana@Example.com", "senha-segura-1");

        var result = await _handler.HandleAsync(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var user = Assert.Single(_users.Users);
        Assert.Equal("ana@example.com", user.Email);
        Assert.Equal("hash:senha-segura-1", user.PasswordHash);
        Assert.Equal(Now.UtcDateTime, user.CreatedAt);
        Assert.Equal(new RegisterUserResponse(user.Id, "Ana Souza", "ana@example.com"), result.Value);
    }

    [Fact]
    public async Task HandleAsync_RecusaEmailJaCadastrado_MesmoComOutraCaixa()
    {
        _users.Users.Add(User.Create("Ana", "ana@example.com", "hash", Now.UtcDateTime));
        var command = new RegisterUserCommand("Outra Ana", "ANA@example.com", "senha-segura-1");

        var result = await _handler.HandleAsync(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Identity.EmailAlreadyRegistered", result.Error!.Code);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);
        Assert.Single(_users.Users);
    }
}
