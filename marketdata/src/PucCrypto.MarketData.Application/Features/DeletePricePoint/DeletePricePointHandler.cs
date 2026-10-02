using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;

namespace PucCrypto.MarketData.Application.Features.DeletePricePoint;

internal sealed class DeletePricePointHandler(IPricePointRepository pricePointRepository)
    : ICommandHandler<DeletePricePointCommand>
{
    public async Task<Result> HandleAsync(DeletePricePointCommand command, CancellationToken cancellationToken)
    {
        if (await pricePointRepository.GetAsync(command.Id, cancellationToken) is null)
        {
            return MarketDataErrors.PricePointNotFound;
        }

        await pricePointRepository.DeleteAsync(command.Id, cancellationToken);

        return Result.Success();
    }
}
