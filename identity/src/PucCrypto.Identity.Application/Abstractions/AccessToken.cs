namespace PucCrypto.Identity.Application.Abstractions;

public sealed record AccessToken(string Value, DateTime ExpiresAt);
