using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Abstractions;

namespace PucCrypto.MarketData.Application.Features.UntrackAsset;

/// <summary>Deixa de acompanhar a criptomoeda e apaga o seu histórico.</summary>
internal sealed class UntrackAssetHandler(
    ITrackedAssetRepository trackedAssetRepository,
    IPricePointRepository pricePointRepository) : ICommandHandler<UntrackAssetCommand>
{
    public async Task<Result> HandleAsync(UntrackAssetCommand command, CancellationToken cancellationToken)
    {
        await pricePointRepository.DeleteByCryptocurrencyAsync(command.CryptocurrencyId, cancellationToken);
        await trackedAssetRepository.DeleteAsync(command.CryptocurrencyId, cancellationToken);

        return Result.Success();
    }
}
