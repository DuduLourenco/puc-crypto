using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.Catalog.Application.Common;

public static class UserCryptoErrors
{
    /// <summary>Usado também quando o item pertence a outro usuário, para não revelar sua existência.</summary>
    public static readonly Error NotFound = Error.NotFound(
        "Catalog.UserCryptoNotFound",
        "Criptomoeda monitorada não encontrada.");
}
