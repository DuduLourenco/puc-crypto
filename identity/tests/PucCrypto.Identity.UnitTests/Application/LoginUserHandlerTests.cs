using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Identity.Application.Features.LoginUser;
using PucCrypto.Identity.Domain.Users;
using PucCrypto.Identity.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Application;

public sealed class LoginUserHandlerTests
{
    private readonly InMemoryUserRepository _users = new();
    private readonly LoginUserHandler _handler;
    private readonly User _user;

    public LoginUserHandlerTests()
    {
        var hasher = new FakePasswordHasher();
        _user = User.Create("Ana", "ana@example.com", hasher.Hash("senha-segura-1"), DateTime.UtcNow);
        _users.Users.Add(_user);
        _handler = new LoginUserHandler(_users, hasher, new FakeJwtTokenGenerator());
    }

    [Fact]
    public async Task HandleAsync_DevolveOTokenQuandoAsCredenciaisConferem()
    {
        var result = await _handler.HandleAsync(
            new LoginUserCommand("Ana@Example.com", "senha-segura-1"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("token-de-" + _user.Id, result.Value.AccessToken);
        Assert.Equal(FakeJwtTokenGenerator.ExpiresAt, result.Value.ExpiresAt);
    }

    [Theory]
    [InlineData("ana@example.com", "senha-errada")]
    [InlineData("ninguem@example.com", "senha-segura-1")]
    public async Task HandleAsync_DevolveAMesmaFalhaParaSenhaErradaEEmailInexistente(string email, string password)
    {
        var result = await _handler.HandleAsync(new LoginUserCommand(email, password), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Identity.InvalidCredentials", result.Error!.Code);
        Assert.Equal(ErrorType.Unauthorized, result.Error.Type);
    }
}
