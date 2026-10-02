using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using PucCrypto.Identity.Domain.Users;
using PucCrypto.Identity.Infrastructure.Security;
using PucCrypto.Identity.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Infrastructure;

public sealed class JwtTokenGeneratorTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);

    private static readonly JwtOptions Options = new()
    {
        Issuer = "emissor-de-teste",
        Audience = "audiencia-de-teste",
        SigningKey = "chave-de-teste-com-pelo-menos-32-bytes!!",
        ExpirationMinutes = 30
    };

    [Fact]
    public void Generate_EmiteTokenComAsClaimsDoUsuarioEAValidadeConfigurada()
    {
        var generator = new JwtTokenGenerator(Microsoft.Extensions.Options.Options.Create(Options), new FixedTimeProvider(Now));
        var user = User.Create("Ana Souza", "ana@example.com", "hash", Now.UtcDateTime);

        var accessToken = generator.Generate(user);

        var token = new JsonWebToken(accessToken.Value);
        Assert.Equal(user.Id.ToString(), token.Subject);
        Assert.Equal("ana@example.com", token.GetClaim("email").Value);
        Assert.Equal("Ana Souza", token.GetClaim("name").Value);
        Assert.Equal("emissor-de-teste", token.Issuer);
        Assert.Contains("audiencia-de-teste", token.Audiences);
        Assert.Equal("HS256", token.Alg);
        Assert.Equal(Now.UtcDateTime.AddMinutes(30), accessToken.ExpiresAt);
        Assert.Equal(accessToken.ExpiresAt, token.ValidTo);
    }
}
