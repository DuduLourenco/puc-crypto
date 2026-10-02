namespace PucCrypto.Catalog.Application.Features.RemoveUserCrypto;

public sealed record RemoveUserCryptoCommand(Guid UserId, Guid Id);
