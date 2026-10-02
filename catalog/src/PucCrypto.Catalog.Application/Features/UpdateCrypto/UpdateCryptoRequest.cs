namespace PucCrypto.Catalog.Application.Features.UpdateCrypto;

/// <summary>Corpo da requisição HTTP.</summary>
public sealed record UpdateCryptoRequest(string Symbol, string Name);
