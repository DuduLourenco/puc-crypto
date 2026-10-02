using PucCrypto.Identity.Domain.Users;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Domain;

public sealed class UserTests
{
    private static readonly DateTime CreatedAt = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_NormalizaNomeEEmail()
    {
        var user = User.Create("  Ana Souza ", "  Ana@Example.COM ", "hash", CreatedAt);

        Assert.Equal("Ana Souza", user.Name);
        Assert.Equal("ana@example.com", user.Email);
    }

    [Fact]
    public void Create_GeraIdEMantemHashEData()
    {
        var user = User.Create("Ana", "ana@example.com", "hash", CreatedAt);

        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.Equal("hash", user.PasswordHash);
        Assert.Equal(CreatedAt, user.CreatedAt);
    }

    [Theory]
    [InlineData("ANA@EXAMPLE.COM", "ana@example.com")]
    [InlineData(" ana@example.com ", "ana@example.com")]
    public void NormalizeEmail_RemoveEspacosEUsaMinusculas(string email, string expected)
    {
        Assert.Equal(expected, User.NormalizeEmail(email));
    }
}
