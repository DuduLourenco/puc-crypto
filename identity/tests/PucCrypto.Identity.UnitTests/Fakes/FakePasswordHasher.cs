using PucCrypto.Identity.Application.Abstractions;

namespace PucCrypto.Identity.UnitTests.Fakes;

internal sealed class FakePasswordHasher : IPasswordHasher
{
    public string Hash(string password) => "hash:" + password;

    public bool Verify(string password, string passwordHash) => passwordHash == Hash(password);
}
