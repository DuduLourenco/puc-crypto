using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.UnitTests.Fakes;

internal sealed class FakeJwtTokenGenerator : IJwtTokenGenerator
{
    public static readonly DateTime ExpiresAt = new(2026, 1, 1, 13, 0, 0, DateTimeKind.Utc);

    public AccessToken Generate(User user) => new("token-de-" + user.Id, ExpiresAt);
}
