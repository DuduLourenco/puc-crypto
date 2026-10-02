using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.UpdatePricePoint;

internal sealed class UpdatePricePointHandler(IPricePointRepository pricePointRepository)
    : ICommandHandler<UpdatePricePointCommand, PricePointResponse>
{
    public async Task<Result<PricePointResponse>> HandleAsync(
        UpdatePricePointCommand command,
        CancellationToken cancellationToken)
    {
        var pricePoint = await pricePointRepository.GetAsync(command.Id, cancellationToken);

        if (pricePoint is null)
        {
            return MarketDataErrors.PricePointNotFound;
        }

        pricePoint.UpdatePrice(command.PriceUsd);

        await pricePointRepository.UpdateAsync(pricePoint, cancellationToken);

        return PricePointResponse.From(pricePoint);
    }
}
