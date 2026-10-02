using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Domain;

public sealed class UserCryptoTests
{
    private static readonly DateTime Now = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
    private static readonly Cryptocurrency Bitcoin = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now);

    [Fact]
    public void Create_AssociaUsuarioECriptomoeda()
    {
        var userId = Guid.NewGuid();

        var userCrypto = UserCrypto.Create(userId, Bitcoin, "  longo prazo  ", Now);

        Assert.Equal(userId, userCrypto.UserId);
        Assert.Equal(Bitcoin.Id, userCrypto.CryptocurrencyId);
        Assert.Same(Bitcoin, userCrypto.Cryptocurrency);
        Assert.Equal("longo prazo", userCrypto.Notes);
        Assert.Equal(Now, userCrypto.AddedAt);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void AnotacaoEmBranco_FicaNula(string? notes)
    {
        var userCrypto = UserCrypto.Create(Guid.NewGuid(), Bitcoin, "algo", Now);

        userCrypto.UpdateNotes(notes);

        Assert.Null(userCrypto.Notes);
    }
}
