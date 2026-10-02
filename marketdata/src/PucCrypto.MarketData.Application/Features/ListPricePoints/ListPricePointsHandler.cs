using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.ListPricePoints;

/// <summary>Histórico de preços de uma criptomoeda, do mais antigo ao mais recente. Usado pelo BFF.</summary>
internal sealed class ListPricePointsHandler(IPricePointRepository pricePointRepository)
    : IQueryHandler<ListPricePointsQuery, IReadOnlyList<PricePointResponse>>
{
    public const int MaxLimit = 1000;

    public async Task<Result<IReadOnlyList<PricePointResponse>>> HandleAsync(
        ListPricePointsQuery query,
        CancellationToken cancellationToken)
    {
        var pricePoints = await pricePointRepository.ListAsync(
            query.CryptocurrencyId,
            query.From?.ToUniversalTime(),
            query.To?.ToUniversalTime(),
            query.Limit ?? MaxLimit,
            cancellationToken);

        return pricePoints.Select(PricePointResponse.From).ToList();
    }
}
