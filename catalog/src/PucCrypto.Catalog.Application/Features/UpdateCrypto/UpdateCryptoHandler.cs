using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.UpdateCrypto;

internal sealed class UpdateCryptoHandler(ICryptocurrencyRepository cryptocurrencyRepository)
    : ICommandHandler<UpdateCryptoCommand, CryptoResponse>
{
    public async Task<Result<CryptoResponse>> HandleAsync(UpdateCryptoCommand command, CancellationToken cancellationToken)
    {
        var cryptocurrency = await cryptocurrencyRepository.GetByIdAsync(command.Id, cancellationToken);

        if (cryptocurrency is null)
        {
            return CryptoErrors.NotFound;
        }

        cryptocurrency.Update(command.Symbol, command.Name);

        await cryptocurrencyRepository.UpdateAsync(cryptocurrency, cancellationToken);

        return CryptoResponse.From(cryptocurrency);
    }
}
