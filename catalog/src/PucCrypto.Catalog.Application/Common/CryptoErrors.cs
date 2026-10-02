using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.Catalog.Application.Common;

public static class CryptoErrors
{
    public static readonly Error NotFound = Error.NotFound(
        "Catalog.CryptoNotFound",
        "Criptomoeda não encontrada no catálogo.");
}
