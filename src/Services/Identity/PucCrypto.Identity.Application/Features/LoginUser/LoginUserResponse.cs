namespace PucCrypto.Identity.Application.Features.LoginUser;

public sealed record LoginUserResponse(string AccessToken, DateTime ExpiresAt);
