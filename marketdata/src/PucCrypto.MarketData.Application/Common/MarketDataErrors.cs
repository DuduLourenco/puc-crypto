using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.MarketData.Application.Common;

public static class MarketDataErrors
{
    public static readonly Error PricePointNotFound = Error.NotFound(
        "MarketData.PricePointNotFound",
        "Preço não encontrado.");

    public static readonly Error AssetNotTracked = Error.NotFound(
        "MarketData.AssetNotTracked",
        "A criptomoeda não está sendo acompanhada. Cadastre-a no Catalog primeiro.");
}
