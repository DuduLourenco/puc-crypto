using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;

namespace PucCrypto.Catalog.Application.Features.UpdateLatestPrice;

internal sealed class UpdateLatestPriceHandler(ICryptocurrencyRepository cryptocurrencyRepository)
    : ICommandHandler<UpdateLatestPriceCommand>
{
    public async Task<Result> HandleAsync(UpdateLatestPriceCommand command, CancellationToken cancellationToken)
    {
        var cryptocurrency = await cryptocurrencyRepository.GetByIdAsync(command.CryptocurrencyId, cancellationToken);

        // A criptomoeda pode ter sido excluída depois que os preços foram coletados.
        if (cryptocurrency is not null && cryptocurrency.UpdateLatestPrice(command.PriceUsd, command.At))
        {
            await cryptocurrencyRepository.UpdateAsync(cryptocurrency, cancellationToken);
        }

        return Result.Success();
    }
}
