namespace PucCrypto.Catalog.Application.Features.UpdateUserCrypto;

public sealed record UpdateUserCryptoCommand(Guid UserId, Guid Id, string? Notes);
