using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.GetPricePoint;

internal sealed class GetPricePointHandler(IPricePointRepository pricePointRepository)
    : IQueryHandler<GetPricePointQuery, PricePointResponse>
{
    public async Task<Result<PricePointResponse>> HandleAsync(GetPricePointQuery query, CancellationToken cancellationToken)
    {
        var pricePoint = await pricePointRepository.GetAsync(query.Id, cancellationToken);

        return pricePoint is null
            ? MarketDataErrors.PricePointNotFound
            : PricePointResponse.From(pricePoint);
    }
}
