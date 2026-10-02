namespace PucCrypto.Identity.Application.Features.RegisterUser;

public sealed record RegisterUserCommand(string Name, string Email, string Password);
