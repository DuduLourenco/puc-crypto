using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;
using PucCrypto.MarketData.Application.Common;
using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.Application.Features.CreatePricePoint;

internal sealed class CreatePricePointHandler(
    ITrackedAssetRepository trackedAssetRepository,
    IPricePointRepository pricePointRepository) : ICommandHandler<CreatePricePointCommand, PricePointResponse>
{
    private static readonly Error AlreadyExists = Error.Conflict(
        "MarketData.PricePointAlreadyExists",
        "Já existe um preço desta criptomoeda neste instante.");

    public async Task<Result<PricePointResponse>> HandleAsync(
        CreatePricePointCommand command,
        CancellationToken cancellationToken)
    {
        if (await trackedAssetRepository.GetAsync(command.CryptocurrencyId, cancellationToken) is null)
        {
            return MarketDataErrors.AssetNotTracked;
        }

        var pricePoint = PricePoint.Create(command.CryptocurrencyId, command.Timestamp, command.PriceUsd, PriceSource.Manual);

        if (await pricePointRepository.ExistsAsync(pricePoint.CryptocurrencyId, pricePoint.Timestamp, cancellationToken))
        {
            return AlreadyExists;
        }

        await pricePointRepository.AddAsync(pricePoint, cancellationToken);

        return PricePointResponse.From(pricePoint);
    }
}
