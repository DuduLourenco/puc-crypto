using PucCrypto.Identity.Infrastructure.Security;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Infrastructure;

public sealed class BCryptPasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher = new();

    [Fact]
    public void Hash_NaoGuardaASenhaEmTextoPuro_EUsaSalDiferenteACadaVez()
    {
        var first = _hasher.Hash("senha-segura-1");
        var second = _hasher.Hash("senha-segura-1");

        Assert.DoesNotContain("senha-segura-1", first);
        Assert.NotEqual(first, second);
    }

    [Fact]
    public void Verify_ConfereApenasASenhaCorreta()
    {
        var hash = _hasher.Hash("senha-segura-1");

        Assert.True(_hasher.Verify("senha-segura-1", hash));
        Assert.False(_hasher.Verify("outra-senha", hash));
    }
}
