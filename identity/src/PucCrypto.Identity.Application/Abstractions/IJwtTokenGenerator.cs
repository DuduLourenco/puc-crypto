using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Application.Abstractions;

public interface IJwtTokenGenerator
{
    AccessToken Generate(User user);
}
