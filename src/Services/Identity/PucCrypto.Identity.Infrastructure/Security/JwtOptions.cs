namespace PucCrypto.Identity.Infrastructure.Security;

internal sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    /// <summary>Tamanho mínimo da chave, em bytes, exigido pelo algoritmo HS256.</summary>
    public const int MinimumSigningKeyBytes = 32;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public string SigningKey { get; init; } = string.Empty;

    public int ExpirationMinutes { get; init; } = 60;
}
