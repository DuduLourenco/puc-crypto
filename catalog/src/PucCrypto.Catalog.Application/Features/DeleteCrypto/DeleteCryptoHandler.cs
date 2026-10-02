using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;
using PucCrypto.Catalog.Application.IntegrationEvents;

namespace PucCrypto.Catalog.Application.Features.DeleteCrypto;

internal sealed class DeleteCryptoHandler(
    ICryptocurrencyRepository cryptocurrencyRepository,
    IUserCryptoRepository userCryptoRepository,
    IEventBus eventBus,
    TimeProvider timeProvider) : ICommandHandler<DeleteCryptoCommand>
{
    private static readonly Error InUse = Error.Conflict(
        "Catalog.CryptoInUse",
        "A criptomoeda está na lista de pelo menos um usuário e não pode ser excluída.");

    public async Task<Result> HandleAsync(DeleteCryptoCommand command, CancellationToken cancellationToken)
    {
        var cryptocurrency = await cryptocurrencyRepository.GetByIdAsync(command.Id, cancellationToken);

        if (cryptocurrency is null)
        {
            return CryptoErrors.NotFound;
        }

        if (await userCryptoRepository.AnyByCryptocurrencyAsync(cryptocurrency.Id, cancellationToken))
        {
            return InUse;
        }

        await cryptocurrencyRepository.RemoveAsync(cryptocurrency, cancellationToken);

        await eventBus.PublishAsync(
            new CryptoRemoved(cryptocurrency.Id, cryptocurrency.CoinGeckoId, timeProvider.GetUtcNow().UtcDateTime),
            cancellationToken);

        return Result.Success();
    }
}
