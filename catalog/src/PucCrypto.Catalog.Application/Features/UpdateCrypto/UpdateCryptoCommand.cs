namespace PucCrypto.Catalog.Application.Features.UpdateCrypto;

public sealed record UpdateCryptoCommand(Guid Id, string Symbol, string Name);
