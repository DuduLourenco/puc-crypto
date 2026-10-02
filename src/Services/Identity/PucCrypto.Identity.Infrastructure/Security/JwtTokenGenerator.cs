using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Infrastructure.Security;

internal sealed class JwtTokenGenerator(IOptions<JwtOptions> options, TimeProvider timeProvider) : IJwtTokenGenerator
{
    private readonly JwtOptions _options = options.Value;

    public AccessToken Generate(User user)
    {
        var issuedAt = timeProvider.GetUtcNow().UtcDateTime;
        var expiresAt = issuedAt.AddMinutes(_options.ExpirationMinutes);

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            ]),
            IssuedAt = issuedAt,
            NotBefore = issuedAt,
            Expires = expiresAt,
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        };

        return new AccessToken(new JsonWebTokenHandler().CreateToken(descriptor), expiresAt);
    }
}
